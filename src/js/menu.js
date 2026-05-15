/* global Fancybox */
import { showToast } from '../js/validation.js';

// ==========================================
// API CONFIG
// ==========================================
const API_URLS = {
  GET_PRODUCTS: 'https://shoes-mall.onrender.com/api/v1/products?page=1&limit=8',

  GET_FAVORITES: 'https://shoes-mall.onrender.com/api/v1/users/favorite',

  LIKE_PRODUCT: (productId) => `https://shoes-mall.onrender.com/api/v1/products/${productId}/like`,

  UNLIKE_PRODUCT: (productId) =>
    `https://shoes-mall.onrender.com/api/v1/products/${productId}/unlike`,

  ADD_TO_CART: 'https://shoes-mall.onrender.com/api/v1/orders/',

  GET_CART: 'https://shoes-mall.onrender.com/api/v1/orders/',
};

// ==========================================
// AUTH HEADERS
// ==========================================
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// ==========================================
// FORMAT PRICE
// ==========================================
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = sessionStorage.getItem('accessToken');

  // ==========================================
  // AUTH UI
  // ==========================================
  const authDropdownMenu = document.getElementById('authDropdownMenu');
  const authDropdownToggle = document.getElementById('authDropdown');

  if (authDropdownMenu && authDropdownToggle) {
    if (accessToken) {
      authDropdownToggle.innerHTML = '<i class="fa fa-user user-icon me-2"></i> Favorite product';

      authDropdownMenu.innerHTML = `
        <li><a class="dropdown-item" href="#">Profile</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" id="signOutBtn">Sign out</a></li>
      `;

      document.getElementById('signOutBtn').addEventListener('click', (e) => {
        e.preventDefault();

        sessionStorage.removeItem('accessToken');

        window.location.reload();
      });

      fetchCartCount();
    } else {
      authDropdownToggle.innerHTML = '<i class="fa fa-user user-icon me-2"></i> Hello';

      authDropdownMenu.innerHTML = `
        <li><a class="dropdown-item" href="#">Sign in</a></li>
        <li><a class="dropdown-item" href="#">Sign up</a></li>
      `;
    }
  }

  // ==========================================
  // LOADING
  // ==========================================
  let loadingInterval;

  function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    if (!overlay || !loadingText) {
      return;
    }

    overlay.style.display = 'flex';

    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);

    let dots = 0;

    loadingText.innerText = 'Loading';

    loadingInterval = setInterval(() => {
      dots = (dots % 3) + 1;

      loadingText.innerText = 'Loading' + '.'.repeat(dots);
    }, 400);
  }

  function hideLoading() {
    const overlay = document.getElementById('loading-overlay');

    if (!overlay) {
      return;
    }

    clearInterval(loadingInterval);

    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }

  // ==========================================
  // FETCH CART COUNT
  // ==========================================
  async function fetchCartCount() {
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {
      const response = await fetch(API_URLS.GET_CART, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      let totalItems = 0;

      if (result.data && Array.isArray(result.data)) {
        totalItems = result.data.length;
      }

      const bagBadge = document.querySelector('.bag-item .badge-count');

      if (bagBadge) {
        bagBadge.innerText = totalItems;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================
  async function fetchProducts() {
    showLoading();

    try {
      let favoriteIds = [];

      const token = sessionStorage.getItem('accessToken');

      const requests = [
        fetch(API_URLS.GET_PRODUCTS, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ];

      if (token) {
        requests.push(
          fetch(API_URLS.GET_FAVORITES, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
        );
      }

      const responses = await Promise.all(requests);

      const productResponse = responses[0];

      if (!productResponse.ok) {
        throw new Error('Cannot fetch products');
      }

      if (responses[1] && responses[1].ok) {
        const favResult = await responses[1].json();

        if (favResult.data) {
          favoriteIds = favResult.data.map((item) => item._id || item.id);
        }
      }

      const result = await productResponse.json();

      if (result.statusCode === 200 && result.data?.items) {
        renderCarousel(result.data.items.slice(0, 4));

        renderProductCards(result.data.items, favoriteIds);

        initializeShopLogic();
      }
    } catch (error) {
      console.error(error);

      showToast(error.message, 'error');
    } finally {
      hideLoading();
    }
  }

  // ==========================================
  // RENDER CAROUSEL
  // ==========================================
  function renderCarousel(products) {
    const carouselInner = document.getElementById('dynamic-carousel-inner');

    const carouselIndicators = document.getElementById('dynamic-carousel-indicators');

    if (!carouselInner || !carouselIndicators) {
      return;
    }

    let innerHTML = '';
    let indicatorsHTML = '';

    products.forEach((product, index) => {
      const isActive = index === 0 ? 'active' : '';

      const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : '';

      indicatorsHTML += `
        <button
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="${index}"
          class="${isActive}"
        ></button>
      `;

      innerHTML += `
        <div class="carousel-item ${isActive}">
          <div class="container">
            <div class="row align-items-center">

              <div class="col-md-7">
                <img
                  src="${imageUrl}"
                  class="img-fluid d-block mx-auto"
                  alt="${product.name}"
                >
              </div>

              <div class="col-md-5">
                <h1 class="product-title">${product.name}</h1>

                <p class="product-desc">
                  ${product.description || 'Premium quality shoes'}
                </p>

                <button
                  type="button"
                  class="btn btn-buy buy-now-btn"
                  data-id="${product._id}"
                >
                  <i class="fa-solid fa-cart-shopping"></i>
                  Buy now
                </button>
              </div>

            </div>
          </div>
        </div>
      `;
    });

    carouselInner.innerHTML = innerHTML;

    carouselIndicators.innerHTML = indicatorsHTML;
  }

  // ==========================================
  // RENDER PRODUCTS
  // ==========================================
  function renderProductCards(products, favoriteIds = []) {
    const productRow = document.getElementById('dynamic-product-row');

    if (!productRow) {
      return;
    }

    const cardsHTML = products
      .map((product) => {
        const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : '';

        const isLiked = favoriteIds.includes(product._id);

        return `
          <div class="col-md-4 mb-4 product-item">

            <div class="product-card">

              <div class="card-header-custom">

                <button
                  type="button"
                  class="btn-heart ${isLiked ? 'active' : ''}"
                  data-id="${product._id}"
                >
                  <i class="fa fa-heart"></i>
                </button>

              </div>

              <div class="product-img-container">
                <img
                  src="${imageUrl}"
                  alt="${product.name}"
                  class="product-img"
                >
              </div>

              <div class="card-body-custom">

                <h5 class="product-name">
                  ${product.name}
                </h5>

                <div class="price-row">

                  <span class="price">
                    ${formatPrice(product.price)}
                  </span>

                  <button
                    type="button"
                    class="buy-now-btn"
                    data-id="${product._id}"
                  >
                    <i class="fa-solid fa-cart-shopping"></i>
                    Buy now
                  </button>

                </div>

              </div>

            </div>

          </div>
        `;
      })
      .join('');

    productRow.innerHTML = cardsHTML;
  }

  // ==========================================
  // SHOP LOGIC
  // ==========================================
  function initializeShopLogic() {
    if (typeof Fancybox !== 'undefined') {
      Fancybox.bind('[data-fancybox="gallery"]', {
        infinite: true,
      });
    }

    // ==========================================
    // BUY NOW
    // ==========================================
    document.body.addEventListener('click', async (e) => {
      const buyBtn = e.target.closest('.buy-now-btn');

      if (!buyBtn) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        showToast('Please login first', 'error');
        return;
      }

      const productId = buyBtn.dataset.id;

      try {
        buyBtn.disabled = true;

        buyBtn.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin"></i>
          Loading
        `;

        const response = await fetch(API_URLS.ADD_TO_CART, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            orders: [
              {
                product_id: productId,
                size: '40',
                amount: 1,
              },
            ],
            address: 'Default address',
          }),
        });

        if (!response.ok) {
          throw new Error('Add to cart failed');
        }

        buyBtn.innerHTML = `
          <i class="fa-solid fa-check"></i>
          Added
        `;

        buyBtn.classList.add('btn-success');

        fetchCartCount();

        showToast('Added to cart', 'success');

        setTimeout(() => {
          window.location.href = '../pages/cart.html';
        }, 800);
      } catch (error) {
        console.error(error);

        buyBtn.disabled = false;

        buyBtn.innerHTML = `
          <i class="fa-solid fa-cart-shopping"></i>
          Buy now
        `;

        showToast('Cannot add to cart', 'error');
      }
    });

    // ==========================================
    // HEART LIKE
    // ==========================================
    document.body.addEventListener('click', async (e) => {
      const heartBtn = e.target.closest('.btn-heart');

      if (!heartBtn) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        showToast('Please login first', 'error');
        return;
      }

      const productId = heartBtn.dataset.id;

      const isLiked = heartBtn.classList.contains('active');

      // UI instantly
      heartBtn.classList.toggle('active');

      try {
        const response = await fetch(
          isLiked ? API_URLS.UNLIKE_PRODUCT(productId) : API_URLS.LIKE_PRODUCT(productId),
          {
            method: 'POST',
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) {
          throw new Error('Like failed');
        }

        // CHANGE HEART COLOR
        const icon = heartBtn.querySelector('i');

        if (heartBtn.classList.contains('active')) {
          icon.style.color = '#ff2e63';
        } else {
          icon.style.color = '#ffffff';
        }

        showToast(isLiked ? 'Removed from favorites' : 'Added to favorites', 'success');
      } catch (error) {
        console.error(error);

        heartBtn.classList.toggle('active');

        showToast('Something went wrong', 'error');
      }
    });
  }

  // ==========================================
  // BACK TO TOP
  // ==========================================
  const backToTopBtn = document.getElementById('btn-back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.style.display = 'block';
      } else {
        backToTopBtn.style.display = 'none';
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  // ==========================================
  // START
  // ==========================================
  fetchProducts();
});
