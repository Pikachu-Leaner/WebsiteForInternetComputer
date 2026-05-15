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
// AUTH HEADER
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

// ==========================================
// DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // AUTH
  // ==========================================
  const authDropdownMenu = document.getElementById('authDropdownMenu');

  const authDropdownToggle = document.getElementById('authDropdown');

  const accessToken = sessionStorage.getItem('accessToken');

  if (authDropdownMenu && authDropdownToggle) {
    if (accessToken) {
      authDropdownToggle.innerHTML = `
        <i class="fa fa-user user-icon me-2"></i>
        My Account
      `;

      authDropdownMenu.innerHTML = `
        <li>
          <a class="dropdown-item" href="./profile.html">
            <i class="fa fa-user me-2"></i>
            Profile
          </a>
        </li>

        <li>
          <a class="dropdown-item" href="./favoriteProduct.html">
            <i class="fa fa-heart me-2"></i>
            Favorite Products
          </a>
        </li>

        <li>
          <a class="dropdown-item" href="./cart.html">
            <i class="fa fa-shopping-cart me-2"></i>
            Cart
          </a>
        </li>

        <li><hr class="dropdown-divider"></li>

        <li>
          <a class="dropdown-item text-danger" href="#" id="signOutBtn">
            <i class="fa fa-sign-out-alt me-2"></i>
            Sign out
          </a>
        </li>
      `;

      const signOutBtn = document.getElementById('signOutBtn');

      if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
          e.preventDefault();

          sessionStorage.removeItem('accessToken');

          window.location.href = './index.html';
        });
      }

      fetchCartCount();

      fetchFavoriteCount();
    } else {
      authDropdownToggle.innerHTML = `
        <i class="fa fa-user user-icon me-2"></i>
        Hello
      `;

      authDropdownMenu.innerHTML = `
        <li>
          <a class="dropdown-item" href="./login.html">
            Sign in
          </a>
        </li>

        <li>
          <a class="dropdown-item" href="./register.html">
            Sign up
          </a>
        </li>
      `;
    }
  }

  // ==========================================
  // TOP ICON NAVIGATION
  // ==========================================
  const favoriteBtn = document.getElementById('favorite-page-btn');

  if (favoriteBtn) {
    favoriteBtn.style.cursor = 'pointer';

    favoriteBtn.addEventListener('click', (e) => {
      e.preventDefault();

      e.stopPropagation();

      window.location.href = './favoriteProduct.html';
    });
  }

  const cartBtn = document.getElementById('cart-page-btn');

  if (cartBtn) {
    cartBtn.style.cursor = 'pointer';

    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();

      e.stopPropagation();

      window.location.href = './cart.html';
    });
  }

  // ==========================================
  // CART COUNT
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

      if (Array.isArray(result.data)) {
        totalItems = result.data.length;
      } else if (result.data?.items) {
        totalItems = result.data.items.length;
      }

      const bagBadge = document.querySelector('#cart-page-btn .badge-count');

      if (bagBadge) {
        bagBadge.innerText = totalItems;
      }
    } catch (error) {
      console.error('Cart count error:', error);
    }
  }

  // ==========================================
  // FAVORITE COUNT
  // ==========================================
  async function fetchFavoriteCount() {
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {
      const response = await fetch(API_URLS.GET_FAVORITES, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      let totalFavorites = 0;

      if (Array.isArray(result.data)) {
        totalFavorites = result.data.length;
      }

      const heartBadge = document.querySelector('#favorite-page-btn .badge-count');

      if (heartBadge) {
        heartBadge.innerText = totalFavorites;
      }
    } catch (error) {
      console.error('Favorite count error:', error);
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

      loadingText.innerText = `Loading${'.'.repeat(dots)}`;
    }, 400);
  }

  function hideLoading() {
    const overlay = document.getElementById('loading-overlay');

    const loadingText = document.getElementById('loading-text');

    if (!overlay || !loadingText) {
      return;
    }

    clearInterval(loadingInterval);

    loadingText.innerText = 'Loading done';

    setTimeout(() => {
      overlay.style.opacity = '0';

      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }, 500);
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
        throw new Error('Failed to fetch products');
      }

      // FAVORITE PRODUCTS
      if (responses[1] && responses[1].ok) {
        const favoriteResult = await responses[1].json();

        if (Array.isArray(favoriteResult.data)) {
          favoriteIds = favoriteResult.data.map((item) => {
            return item._id || item.id || item.product_id;
          });
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

      showToast('Error fetching products', 'error');
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
                <a
                  href="${imageUrl}"
                  data-fancybox="gallery"
                  data-caption="${product.name}"
                >
                  <img
                    src="${imageUrl}"
                    class="img-fluid d-block mx-auto"
                    alt="${product.name}"
                  >
                </a>
              </div>

              <div class="col-md-5">
                <h1 class="product-title">
                  ${product.name}
                </h1>

                <p class="product-desc">
                  ${product.description || 'Premium quality shoes'}
                </p>

                <button
                  class="btn btn-buy buy-now-btn"
                  data-id="${product._id}"
                  type="button"
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

    carouselIndicators.innerHTML = indicatorsHTML;

    carouselInner.innerHTML = innerHTML;
  }

  // ==========================================
  // RENDER PRODUCT CARDS
  // ==========================================
  function renderProductCards(products, favoriteIds = []) {
    const productRow = document.getElementById('dynamic-product-row');

    if (!productRow) {
      return;
    }

    const cardsHTML = products
      .map((product) => {
        const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : '';

        const brandSlug = product.brand?.slug || 'other';

        const isLiked = favoriteIds.includes(product._id);

        return `
          <div
            class="col-lg-3 col-md-4 col-sm-6 mb-4 product-item"
            data-category="${brandSlug}"
          >
            <div class="product-card">

              <div class="card-header-custom">
                <button
                  type="button"
                  class="btn-heart ${isLiked ? 'active' : ''}"
                  data-id="${product._id}"
                >
                  <i class="fa fa-heart heart-icon"></i>
                </button>
              </div>

              <div class="product-img-container">
                <a
                  href="${imageUrl}"
                  data-fancybox="gallery"
                  data-caption="${product.name}"
                >
                  <img
                    src="${imageUrl}"
                    alt="${product.name}"
                    class="product-img"
                  >
                </a>
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
    // ==========================================
    // FANCYBOX
    // ==========================================
    if (typeof Fancybox !== 'undefined') {
      Fancybox.bind('[data-fancybox="gallery"]', {
        infinite: true,
      });
    }

    // ==========================================
    // BUY NOW
    // ==========================================
    if (!document.body.dataset.buyInitialized) {
      document.body.dataset.buyInitialized = 'true';

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

          window.location.href = './login.html';

          return;
        }

        const productId = buyBtn.dataset.id;

        showLoading();

        try {
          const response = await fetch(API_URLS.ADD_TO_CART, {
            method: 'POST',

            headers: {
              ...getAuthHeaders(),
              accept: 'application/json',
            },

            body: JSON.stringify({
              orders: [
                {
                  product_id: productId,
                  size: '40',
                  amount: 1,
                },
              ],

              address: 'Default Address',
            }),
          });

          if (!response.ok) {
            throw new Error('Add to cart failed');
          }

          buyBtn.classList.add('added');

          buyBtn.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Added
          `;

          await fetchCartCount();

          showToast('Added to cart', 'success');

          setTimeout(() => {
            window.location.href = './cart.html';
          }, 500);
        } catch (error) {
          console.error(error);

          showToast('Add to cart failed', 'error');
        } finally {
          hideLoading();
        }
      });
    }

    // ==========================================
    // FAVORITE
    // ==========================================
    if (!document.body.dataset.likeInitialized) {
      document.body.dataset.likeInitialized = 'true';

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

          window.location.href = './login.html';

          return;
        }

        const productId = heartBtn.dataset.id;

        const isCurrentlyLiked = heartBtn.classList.contains('active');

        // UI CHANGE FIRST
        heartBtn.classList.toggle('active');

        try {
          const response = await fetch(
            isCurrentlyLiked
              ? API_URLS.UNLIKE_PRODUCT(productId)
              : API_URLS.LIKE_PRODUCT(productId),
            {
              method: 'POST',
              headers: getAuthHeaders(),
            },
          );

          if (!response.ok) {
            throw new Error('Favorite failed');
          }

          await fetchFavoriteCount();

          showToast(isCurrentlyLiked ? 'Removed from favorites' : 'Added to favorites', 'success');
        } catch (error) {
          console.error(error);

          // REVERT UI
          heartBtn.classList.toggle('active');

          showToast('Favorite action failed', 'error');
        }
      });
    }

    // ==========================================
    // GRID / LIST SWITCH
    // ==========================================
    const btnGridView = document.getElementById('btn-grid-view');

    const btnListView = document.getElementById('btn-list-view');

    const productContainer = document.getElementById('product-container');

    if (btnGridView && btnListView && productContainer) {
      btnGridView.addEventListener('click', () => {
        productContainer.classList.remove('list-view');

        btnGridView.classList.remove('btn-outline-dark');

        btnGridView.classList.add('btn-dark');

        btnListView.classList.remove('btn-dark');

        btnListView.classList.add('btn-outline-dark');
      });

      btnListView.addEventListener('click', () => {
        productContainer.classList.add('list-view');

        btnListView.classList.remove('btn-outline-dark');

        btnListView.classList.add('btn-dark');

        btnGridView.classList.remove('btn-dark');

        btnGridView.classList.add('btn-outline-dark');
      });
    }

    // ==========================================
    // NAVBAR ACTIVE SYNC
    // ==========================================
    const topNavLinks = document.querySelectorAll('.navbar .nav-link');

    const filterTabs = document.querySelectorAll('.nav-pills .nav-link');

    function clearActive() {
      topNavLinks.forEach((link) => {
        link.classList.remove('active');
      });

      filterTabs.forEach((link) => {
        link.classList.remove('active');
      });
    }

    function setActiveByText(text) {
      topNavLinks.forEach((link) => {
        if (link.textContent.trim().toLowerCase() === text.toLowerCase()) {
          link.classList.add('active');
        }
      });

      filterTabs.forEach((link) => {
        if (link.textContent.trim().toLowerCase() === text.toLowerCase()) {
          link.classList.add('active');
        }
      });
    }

    [...topNavLinks, ...filterTabs].forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const category = link.textContent.trim();

        clearActive();

        setActiveByText(category);

        const items = document.querySelectorAll('.product-item');

        items.forEach((item) => {
          if (category.toLowerCase() === 'home' || category.toLowerCase() === 'all products') {
            item.style.display = '';
          } else {
            const itemCategory = item.dataset.category?.toLowerCase();

            item.style.display = itemCategory === category.toLowerCase() ? '' : 'none';
          }
        });
      });
    });
  }

  // ==========================================
  // START
  // ==========================================
  fetchProducts();
});
