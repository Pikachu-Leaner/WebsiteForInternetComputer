import { showToast } from '../js/validation.js';

// Global array to store the cart items locally
let cartItems = [];

// Helper function to simulate a delay
function simulateDelay() {
  const delayTime = Math.floor(Math.random() * 500) + 500;
  return new Promise((resolve) => setTimeout(resolve, delayTime));
}

// Full-screen Loading Helpers matching your HTML
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('d-none');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('d-none');
}

// CUSTOM BOOTSTRAP 5 BLURRY CONFIRM MODAL
function showCustomConfirm(message) {
  return new Promise((resolve) => {
    let modalEl = document.getElementById('custom-confirm-modal');
    if (!modalEl) {
      const modalHtml = `
        <div class="modal fade custom-blur-modal" id="custom-confirm-modal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-center p-4 border-0 shadow-lg" style="border-radius: 15px;">
              <div class="modal-body">
                <h5 class="mb-4 fw-normal text-dark" id="custom-confirm-message"></h5>
                <div class="d-flex justify-content-center gap-3 mt-4">
                  <button type="button" class="btn btn-purple px-4 py-2 fw-bold" id="custom-confirm-yes">I'm sure</button>
                  <button type="button" class="btn btn-purple px-4 py-2 fw-bold" id="custom-confirm-no">Let me think again</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modalEl = document.getElementById('custom-confirm-modal');

      const style = document.createElement('style');
      style.innerHTML = `
        .custom-blur-modal {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          background-color: rgba(0, 0, 0, 0.4);
        }
      `;
      document.head.appendChild(style);
    }

    document.getElementById('custom-confirm-message').innerText = message;

    // eslint-disable-next-line no-undef
    const bsModal = new bootstrap.Modal(modalEl, {
      backdrop: false,
      keyboard: false,
    });

    const btnYes = document.getElementById('custom-confirm-yes');
    const btnNo = document.getElementById('custom-confirm-no');

    const handleChoice = (result) => {
      bsModal.hide();
      btnYes.replaceWith(btnYes.cloneNode(true));
      btnNo.replaceWith(btnNo.cloneNode(true));
      resolve(result);
    };

    btnYes.addEventListener('click', () => handleChoice(true));
    btnNo.addEventListener('click', () => handleChoice(false));

    bsModal.show();
  });
}

// INSTANT AUTHENTICATION CHECK
const token = sessionStorage.getItem('accessToken');
if (!token) {
  window.location.href = '../pages/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCartData();
});

// Fetch Data from Backend
async function fetchCartData() {
  const container = document.getElementById('cart-items-container');

  container.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-5">
                <div class="spinner-border text-dark mb-2" role="status"></div>
                <p class="text-muted">Loading your cart...</p>
            </td>
        </tr>
    `;

  try {
    const orderResponse = await fetch('https://shoes-mall.onrender.com/api/v1/orders/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const orderResult = await orderResponse.json();

    if (orderResponse.ok && orderResult.data) {
      // Filter out everything except "pending" orders
      const activeOrders = orderResult.data.filter((order) => order.state === 'pending');

      const cartCountBadge = document.querySelector('.cart-badge-count');
      if (cartCountBadge) {
        cartCountBadge.innerText = activeOrders.length;
      }

      const enrichedOrders = await Promise.all(
        activeOrders.map(async (order) => {
          try {
            const productRes = await fetch(
              `https://shoes-mall.onrender.com/api/v1/products/${order.product_id}`,
              { method: 'GET' }
            );

            if (productRes.ok) {
              const productResult = await productRes.json();
              const productData = productResult.data || productResult;

              let imgUrl = 'https://via.placeholder.com/60x60/1a1a1a/ffffff?text=No+Image';
              if (productData.images && productData.images.length > 0) {
                imgUrl = productData.images[0].url || productData.images[0];
              }

              return {
                ...order,
                product_name: productData.name || 'Unknown Product',
                product_image: imgUrl,
                quantity: order.amount > 0 ? order.amount : 1,
                selected: true,
                maxStock: 100,
              };
            }
          } catch (error) {
            showToast(
              `Failed to fetch product details for ${order.product_id}: ${error.message}`,
              'error'
            );
          }

          return {
            ...order,
            product_name: 'Product Details Unavailable',
            product_image: 'https://via.placeholder.com/60x60/1a1a1a/ffffff?text=Error',
            quantity: order.amount > 0 ? order.amount : 1,
            selected: true,
            maxStock: 100,
          };
        })
      );

      cartItems = enrichedOrders;
      updateCartUI();
    } else {
      container.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-danger">Failed to load cart data.</td></tr>`;
      showToast('Failed to load cart data from the server.', 'error');
    }
  } catch (error) {
    container.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-danger">Network error occurred.</td></tr>`;
    showToast(`Network error fetching cart data: ${error.message}`, 'error');
  }
}

// Function to save quantity to the Backend (WORKAROUND: Cancel old, Create New)
async function saveQuantityToBackend(oldOrderId, productId, newQuantity) {
  try {
    // Cancel the old order first so we don't get duplicates
    const delResponse = await fetch(
      `https://shoes-mall.onrender.com/api/v1/orders/${oldOrderId}/cancel`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!delResponse.ok) {
      showToast('Failed to update quantity: Could not remove old record.', 'error');
      return false;
    }

    // Create the new order with the updated quantity
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/orders/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orders: [
          {
            product_id: productId,
            size: '40', // for now for api to accept
            amount: newQuantity,
          },
        ],
        address: 'Somewhere somewhere', // for now for api to accept
      }),
    });

    await simulateDelay();
    if (!response.ok) {
      showToast('Failed to save the new quantity on the server.', 'error');
      return false;
    }
    return true;
  } catch (error) {
    showToast(`API Error updating quantity: ${error.message}`, 'error');
    return false;
  }
}

// Function to Delete Item from Backend (PUT)
async function deleteItemFromBackend(orderId) {
  try {
    const response = await fetch(
      `https://shoes-mall.onrender.com/api/v1/orders/${orderId}/cancel`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await simulateDelay();
    if (!response.ok) {
      showToast('Failed to remove item from the server.', 'error');
    }
    return response.ok;
  } catch (error) {
    showToast(`API Error deleting item: ${error.message}`, 'error');
    return false;
  }
}

// Generate HTML for a single cart item row
function createCartItemCard(item) {
  const rowTotal = item.price * item.quantity;
  const isChecked = item.selected ? 'checked' : '';

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(item.price);
  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(rowTotal);

  return `
        <tr class="cart-item-row" data-order-id="${item._id}" data-product-id="${item.product_id}">
            <td>
                <input class="form-check-input custom-checkbox item-checkbox" type="checkbox" ${isChecked}>
            </td>
            <td>${item._id.substring(0, 5)}...</td> 
            <td>
                <img src="${item.product_image}" alt="${item.product_name}" class="product-img-cart" style="width: 60px; height: auto;">
            </td>
            <td>${item.product_name}</td>
            <td>${formattedPrice}</td>
            <td>
                <div class="d-flex justify-content-center align-items-center">
                    <button class="btn btn-qty btn-purple shadow-sm btn-decrease">-</button>
                    <input type="number" class="form-control text-center mx-2 qty-input" value="${item.quantity}" min="1" max="${item.maxStock}" style="width: 60px;">
                    <button class="btn btn-qty btn-purple shadow-sm btn-increase">+</button>
                </div>
            </td>
            <td class="fw-bold">${formattedTotal}</td>
            <td class="text-center">
                <button class="btn btn-action btn-danger shadow-sm btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
}

// Update the UI based on the cartItems array
function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const submitSection = document.getElementById('submit-order-section');
  const itemCountText = document.getElementById('cart-item-count');
  const selectAllCheckbox = document.getElementById('select-all-checkbox');

  if (itemCountText) itemCountText.innerText = cartItems.length;

  if (cartItems.length === 0) {
    submitSection.classList.add('d-none');
    selectAllCheckbox.checked = false;
    container.innerHTML = `
            <tr id="empty-cart-state">
                <td colspan="8" class="text-center py-5 text-muted">
                    <h4 class="fw-normal mb-2">Your cart is empty</h4>
                    <p class="mb-0">Items you add from the store will appear here.</p>
                </td>
            </tr>
        `;
  } else {
    submitSection.classList.remove('d-none');
    container.innerHTML = cartItems.map((item) => createCartItemCard(item)).join('');

    const allSelected = cartItems.every((item) => item.selected);
    selectAllCheckbox.checked = allSelected;
  }
}

// Handle 'Select All' checkbox in the header
document.getElementById('select-all-checkbox').addEventListener('change', function (e) {
  const isChecked = e.target.checked;
  cartItems.forEach((item) => {
    item.selected = isChecked;
  });
  updateCartUI();
});

// Event Delegation for Buttons (+, -, DELETE)
document.getElementById('cart-items-container').addEventListener('click', async function (e) {
  const row = e.target.closest('tr');
  if (!row || !row.dataset.orderId) return;

  const orderId = row.dataset.orderId;
  const productId = row.dataset.productId;
  const itemIndex = cartItems.findIndex((i) => i._id === orderId);

  if (itemIndex === -1) return;

  const btnIncrease = e.target.closest('.btn-increase');
  const btnDecrease = e.target.closest('.btn-decrease');
  const btnDelete = e.target.closest('.btn-delete');

  if (btnIncrease) {
    let currentQty = Number(cartItems[itemIndex].quantity);
    let newQty = currentQty + 1;

    if (currentQty < cartItems[itemIndex].maxStock) {
      showLoading();

      const success = await saveQuantityToBackend(orderId, productId, newQty);

      hideLoading();

      if (success) {
        fetchCartData();
      }
    } else {
      showToast('Max stock limit reached.', 'error');
    }
  }

  if (btnDecrease) {
    let currentQty = Number(cartItems[itemIndex].quantity);
    let newQty = currentQty - 1;

    if (currentQty > 1) {
      showLoading();

      const success = await saveQuantityToBackend(orderId, productId, newQty);

      hideLoading();

      if (success) {
        fetchCartData();
      }
    }
  }

  if (btnDelete) {
    const isConfirmed = await showCustomConfirm('Are you sure you want to canel this product ?');
    if (!isConfirmed) return;

    showLoading();
    const success = await deleteItemFromBackend(orderId);
    hideLoading();

    if (success) {
      cartItems.splice(itemIndex, 1);
      const cartCountBadge = document.querySelector('.cart-badge-count');
      if (cartCountBadge) cartCountBadge.innerText = cartItems.length;
      updateCartUI();
    }
  }
});

// Handle manual quantity typing AND individual item checkboxes
document.getElementById('cart-items-container').addEventListener('change', async function (e) {
  const row = e.target.closest('tr');
  if (!row || !row.dataset.orderId) return;

  const orderId = row.dataset.orderId;
  const productId = row.dataset.productId;
  const itemIndex = cartItems.findIndex((i) => i._id === orderId);

  if (itemIndex === -1) return;

  const qtyInput = e.target;

  if (qtyInput.classList.contains('qty-input')) {
    let newQty = parseInt(qtyInput.value);
    const maxAllowed = cartItems[itemIndex].maxStock;

    if (isNaN(newQty) || newQty < 1) newQty = 1;
    else if (newQty > maxAllowed) {
      newQty = maxAllowed;
      showToast(`Limit is ${maxAllowed}.`, 'error');
    }

    if (newQty !== cartItems[itemIndex].quantity) {
      showLoading();

      const success = await saveQuantityToBackend(orderId, productId, newQty);

      hideLoading();

      if (success) {
        fetchCartData();
      } else {
        qtyInput.value = cartItems[itemIndex].quantity;
      }
    }
  }

  if (e.target.classList.contains('item-checkbox')) {
    cartItems[itemIndex].selected = e.target.checked;
    updateCartUI();
  }
});

// Submit Order to Backend (POST)
async function submitOrder(event) {
  const selectedItems = cartItems.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    showToast('Please select at least one item to order.', 'error');
    return;
  }

  const orderPayload = {
    orders: selectedItems.map((item) => ({
      product_id: item.product_id,
      size: item.size || '40',
      amount: item.quantity,
    })),
    address: '123 Default Street, HCM City',
  };

  showLoading();

  try {
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/orders/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (response.ok) {
      hideLoading();

      const container = document.getElementById('cart-items-container');
      const submitSection = document.getElementById('submit-order-section');

      if (submitSection) submitSection.classList.add('d-none');

      container.innerHTML = `
          <tr>
              <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-dark mb-3" role="status"></div>
                  <h4 class="fw-normal mb-0 text-dark" id="order-loading-text">Loading .</h4>
              </td>
          </tr>
      `;

      const loadingTextElement = document.getElementById('order-loading-text');
      let dots = 1;
      const dotInterval = setInterval(() => {
        dots = (dots % 3) + 1;
        if (loadingTextElement) {
          loadingTextElement.innerText = 'Loading ' + '.'.repeat(dots);
        }
      }, 400);

      setTimeout(() => {
        clearInterval(dotInterval);

        container.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-success">
                    <i class="fa-solid fa-circle-check fa-3x mb-3"></i>
                    <h3 class="fw-bold mb-0">Order have been sent</h3>
                </td>
            </tr>
        `;

        cartItems = cartItems.filter((item) => !item.selected);

        const cartCountBadge = document.querySelector('.cart-badge-count');
        if (cartCountBadge) {
          cartCountBadge.innerText = cartItems.length;
        }
      }, 3000);
    } else {
      hideLoading();
      const result = await response.json();
      showToast(`Failed to place order: ${result.message || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    hideLoading();
    showToast(`An error occurred while submitting your order: ${error.message}`, 'error');
  }
}

// Listen for clicks on the SUBMIT ORDER button
document.getElementById('submit-order-section').addEventListener('click', function (e) {
  if (e.target.classList.contains('btn-submit')) {
    submitOrder(e);
  }
});
