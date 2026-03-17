// Global array to store the cart items locally
let cartItems = [];

// Fetch Data from Backend
async function fetchCartData() {
  const token = sessionStorage.getItem('accessToken');

  if (!token) {
    console.error('No access token found. User might not be logged in.');
    return;
  }

  try {
    // For now use get all favorite since didn't make get order product for user
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/favorite', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Extract the limit header directly from the response
    const headerLimit = response.headers.get('x-ratelimit-limit');
    // Convert to integer. Fallback to 100 if the header is missing or undefined
    const maxStock = headerLimit ? parseInt(headerLimit, 10) : 100;

    const result = await response.json();

    if (result.statusCode === 200) {
      // Map the backend data to our state array
      cartItems = result.data.map((item) => ({
        ...item,
        // Ensure quantity is at least 1 for the UI
        quantity: item.quantity > 0 ? item.quantity : 1,
        selected: true, // Default to checked
        maxStock: maxStock // Save the max stock limit to every item
      }));

      // Render the table
      updateCartUI();
    } else {
      console.error('Backend returned an error:', result.message);
    }
  } catch (error) {
    console.error('Failed to fetch cart data:', error);
  }
}

// Function to save quantity to the Backend
async function saveQuantityToBackend(productId, newQuantity) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return false;

  try {
      // Change this URL to your actual endpoint for updating order quantities
      const response = await fetch('https://shoes-mall.onrender.com/api/v1/orders/', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              product_id: productId, 
              amount: newQuantity 
          })
      });

      const result = await response.json();

      if (result.statusCode === 200) {
          return true;
      } else {
          console.error("Failed to save:", result.message);
          return false;
      }
  } catch (error) {
      console.error("API Error:", error);
      return false;
  }
}

// Generate HTML for a single cart item row
function createCartItemCard(item) {
  // Calculate and Display Subtotal per Item
  const rowTotal = item.price * item.quantity;
  const isChecked = item.selected ? 'checked' : '';

  // Safely extract the image URL from the 'images' array
  let imgUrl = 'https://via.placeholder.com/60x30/1a1a1a/ffffff?text=Product';
  if (item.images && item.images.length > 0) {
    imgUrl = item.images[0].url;
  }

  return `
        <tr class="cart-item-row" data-id="${item._id}">
            <td>
                <input class="form-check-input custom-checkbox item-checkbox" type="checkbox" ${isChecked}>
            </td>
            <td>${item._id.substring(0, 5)}...</td> 
            <td>
                <img src="${imgUrl}" alt="${item.name}" class="product-img" style="width: 60px; height: auto;">
            </td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>
                <div class="d-flex justify-content-center align-items-center">
                    <button class="btn btn-qty btn-purple shadow-sm btn-decrease">-</button>
                    <input type="number" class="form-control text-center mx-2 qty-input" value="${item.quantity}" min="1" max="${item.maxStock}">
                    <button class="btn btn-qty btn-purple shadow-sm btn-increase">+</button>
                </div>
            </td>
            <td>${rowTotal}</td>
            <td class="text-center">
                <button class="btn btn-action btn-purple shadow-sm me-2 btn-edit">EDIT</button>
                <button class="btn btn-action btn-red shadow-sm btn-delete">DELETE</button>
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

  // Update Header Count
  itemCountText.innerText = cartItems.length;
  
  // Show all the card product
  if (cartItems.length === 0) {
    submitSection.classList.add('d-none');
    selectAllCheckbox.checked = false; // Uncheck if empty
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

    // Sync the "Select All" header checkbox based on item states
    const allSelected = cartItems.every((item) => item.selected);
    selectAllCheckbox.checked = allSelected;
  }
}

// Handle 'Select All' checkbox in the header
document.getElementById('select-all-checkbox').addEventListener('change', function (e) {
  const isChecked = e.target.checked;

  // Set all items to match the header checkbox
  cartItems.forEach((item) => {
    item.selected = isChecked;
  });

  updateCartUI();
});

// Event Delegation for Buttons (+, -, DELETE)
document.getElementById('cart-items-container').addEventListener('click', async function (e) {
  const row = e.target.closest('tr');
  if (!row || !row.dataset.id) return;

  const itemId = row.dataset.id;
  const itemIndex = cartItems.findIndex((i) => i._id === itemId);

  if (itemIndex === -1) return;

  const btnIncrease = e.target.closest('.btn-increase');
  const btnDecrease = e.target.closest('.btn-decrease');
  const spinnerHtml = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

  // Handle '+' button click for product quantity
  if (btnIncrease) {
    let currentQty = Number(cartItems[itemIndex].quantity);
    let newQty = currentQty + 1;

    // Enforce Max Stock Limit when clicking +
    if (currentQty < cartItems[itemIndex].maxStock) {
        // Show loading spinner
        btnIncrease.innerHTML = spinnerHtml;
        btnIncrease.disabled = true;

        // Call API
        const success = await saveQuantityToBackend(itemId, newQty);

        if (success) {
            cartItems[itemIndex].quantity = newQty;
            updateCartUI();
        } else {
            alert("Failed to update quantity on the server.");
            btnIncrease.innerHTML = '+';
            btnIncrease.disabled = false;
        }
    } else {
        alert(`You have reached the maximum stock limit of ${cartItems[itemIndex].maxStock} for this item.`);
    }
  }

  // Handle '-' button click for product quantity
  if (btnDecrease) {
    let currentQty = Number(cartItems[itemIndex].quantity);
    let newQty = currentQty - 1;

    if (currentQty > 1) {
        // Show loading spinner
        btnDecrease.innerHTML = spinnerHtml;
        btnDecrease.disabled = true;

        // Call API
        const success = await saveQuantityToBackend(itemId, newQty);

        if (success) {
            cartItems[itemIndex].quantity = newQty;
            updateCartUI();
        } else {
            alert("Failed to update quantity on the server.");
            btnDecrease.innerHTML = '-';
            btnDecrease.disabled = false;
        }
    }
  }

  // Handle 'DELETE' button click
  if (e.target.closest('.btn-delete')) {
    cartItems.splice(itemIndex, 1);
    updateCartUI();
  }
});

// Handle manual quantity typing AND individual item checkboxes
document.getElementById('cart-items-container').addEventListener('change', async function (e) {
  const row = e.target.closest('tr');
  if (!row || !row.dataset.id) return;

  const itemId = row.dataset.id;
  const itemIndex = cartItems.findIndex((i) => i._id === itemId);

  if (itemIndex === -1) return;

  const qtyInput = e.target;

  // Handle manual quantity input typing from user
  if (qtyInput.classList.contains('qty-input')) {
    let newQty = parseInt(qtyInput.value);
    const maxAllowed = cartItems[itemIndex].maxStock; 

    // Prevent negative numbers or text
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    } 
    // Enforce Max Stock Limit if user types a number that is too high
    else if (newQty > maxAllowed) {
        newQty = maxAllowed;
        alert(`You can only order up to ${maxAllowed} of this item.`);
    }

    // Only call API if the number actually changed
    if (newQty !== cartItems[itemIndex].quantity) {
        qtyInput.disabled = true; // Disable while loading

        const success = await saveQuantityToBackend(itemId, newQty);

        if (success) {
            cartItems[itemIndex].quantity = newQty;
            updateCartUI();
        } else {
            alert("Failed to update quantity on the server.");
            qtyInput.value = cartItems[itemIndex].quantity; // Revert
            qtyInput.disabled = false;
        }
    }
  }

  // Handle clicking an individual item's checkbox
  if (e.target.classList.contains('item-checkbox')) {
    cartItems[itemIndex].selected = e.target.checked;
    updateCartUI();
  }
});

// Kick off the fetch when the script loads
fetchCartData();