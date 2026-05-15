/* global Fancybox */
import { showToast } from '../js/validation.js';

// API Configuration
const API_URLS = {
  GET_PRODUCTS: 'https://shoes-mall.onrender.com/api/v1/products?page=1&limit=8',
  GET_FAVORITES: 'https://shoes-mall.onrender.com/api/v1/users/favorite',
  LIKE_PRODUCT: (productId) => `https://shoes-mall.onrender.com/api/v1/products/${productId}/like`,
  UNLIKE_PRODUCT: (productId) =>
    `https://shoes-mall.onrender.com/api/v1/products/${productId}/unlike`,
  ADD_TO_CART: 'https://shoes-mall.onrender.com/api/v1/orders/',
  GET_CART: 'https://shoes-mall.onrender.com/api/v1/orders/',
};

// Helper for authorization headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Helper to format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

document.addEventListener('DOMContentLoaded', () => {
  // AUTHENTICATION DROPDOWN LOGIC
  const authDropdownMenu = document.getElementById('authDropdownMenu');
  const authDropdownToggle = document.getElementById('authDropdown');
  const accessToken = sessionStorage.getItem('accessToken');

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

      // Fetch cart count on load if logged in
      fetchCartCount();
    } else {
      authDropdownToggle.innerHTML = '<i class="fa fa-user user-icon me-2"></i> Hello';
      authDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#">Sign in</a></li>
                <li><a class="dropdown-item" href="#">Sign up</a></li>
            `;
    }
  }

  // GET CART COUNT LOGIC
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

      if (response.ok) {
        const result = await response.json();

        // Better data mapping to find the order count ---
        let totalItems = 0;
        if (result.data && Array.isArray(result.data)) {
          totalItems = result.data.length;
        } else if (result.data && Array.isArray(result.data.items)) {
          totalItems = result.data.items.length;
        } else if (Array.isArray(result)) {
          totalItems = result.length;
        }

        const bagBadge = document.querySelector('.bag-item .badge-count');
        if (bagBadge) {
          bagBadge.innerText = totalItems;
        }
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  }

  // GRID / LIST VIEW TOGGLE
  const btnGridView = document.getElementById('btn-grid-view');
  const btnListView = document.getElementById('btn-list-view');
  const productContainer = document.getElementById('product-container');

  if (btnGridView && btnListView && productContainer) {
    btnListView.addEventListener('click', () => {
      productContainer.classList.add('list-view');
      btnListView.classList.replace('btn-outline-dark', 'btn-dark');
      btnGridView.classList.replace('btn-dark', 'btn-outline-dark');
    });

    btnGridView.addEventListener('click', () => {
      productContainer.classList.remove('list-view');
      btnGridView.classList.replace('btn-outline-dark', 'btn-dark');
      btnListView.classList.replace('btn-dark', 'btn-outline-dark');
    });
  }

  // BACK TO TOP BUTTON
  const backToTopBtn = document.getElementById('btn-back-to-top');
  let isBtnVisible = false;

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      const scrollPos = document.body.scrollTop || document.documentElement.scrollTop;
      if (scrollPos > 300) {
        if (!isBtnVisible) {
          backToTopBtn.style.display = 'block';
          backToTopBtn.classList.remove('animate__fadeOutDown');
          backToTopBtn.classList.add('animate__fadeInUp');
          isBtnVisible = true;
        }
      } else {
        if (isBtnVisible) {
          backToTopBtn.classList.remove('animate__fadeInUp');
          backToTopBtn.classList.add('animate__fadeOutDown');
          isBtnVisible = false;
          backToTopBtn.addEventListener('animationend', function hideAfterAnimation() {
            if (!isBtnVisible) {
              backToTopBtn.style.display = 'none';
            }
            backToTopBtn.removeEventListener('animationend', hideAfterAnimation);
          });
        }
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // LOADING SPINNER LOGIC (Page level)
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

  // FETCH DATA & RENDER HTML
  async function fetchProducts() {
    showLoading();

    try {
      let favoriteIds = [];
      const token = sessionStorage.getItem('accessToken');

      const requests = [
        fetch(API_URLS.GET_PRODUCTS, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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

      if (responses[1] && responses[1].ok) {
        try {
          const favResult = await responses[1].json();
          if (favResult.data) {
            favoriteIds = favResult.data.map((item) => item._id || item.id);
          }
        } catch (err) {
          console.error('Failed to parse favorites:', err);
        }
      }

      const result = await productResponse.json();

      if (result.statusCode === 200 && result.data && result.data.items) {
        const products = result.data.items;
        renderCarousel(products.slice(0, 4));
        renderProductCards(products, favoriteIds);
        initializeShopLogic();
      }
    } catch (error) {
      showToast('Error fetching data: ' + error.message, 'error');
    } finally {
      hideLoading();
    }
  }

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

      indicatorsHTML += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" class="${isActive}" aria-current="${isActive ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>`;

      innerHTML += `
                <div class="carousel-item ${isActive}">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-md-7">
                                <a href="${imageUrl}" data-fancybox="gallery" data-caption="${product.name}">
                                    <img src="${imageUrl}" class="img-fluid d-block mx-auto" alt="${product.name}">
                                </a>
                            </div>
                            <div class="col-md-5">
                                <h1 class="product-title">${product.name}</h1>
                                <p class="product-desc">${product.description || 'Premium quality shoes.'}</p>
                                <button class="btn btn-buy buy-now-btn" data-id="${product._id}">
                                    <i class="fa-solid fa-cart-shopping cart-icon"></i> Buy now
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

  function renderProductCards(products, favoriteIds = []) {
    const productRow = document.getElementById('dynamic-product-row');
    if (!productRow) {
      return;
    }

    const cardsHTML = products
      .map((product) => {
        const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : '';
        const brandSlug = product.brand ? product.brand.slug : 'other';
        const discountTag =
          product.discount > 0 ? `<span class="Sale-item">SALE ${product.discount}%</span>` : '';

        const isLiked = favoriteIds.includes(product._id);
        const heartClass = isLiked ? 'btn-heart active' : 'btn-heart';

        return `
                <div class="col-md-4 mb-4 product-item" data-category="${brandSlug}">
                    <div class="product-card">
                        <div class="card-header-custom">
                            <a href="#" class="${heartClass}" data-id="${product._id}">
                                <i class="fa fa-heart heart-icon"></i>
                            </a>
                        </div>
                        <div class="product-img-container">
                            <a href="${imageUrl}" data-fancybox="gallery" data-caption="${product.name}">
                                <img src="${imageUrl}" alt="${product.name}" class="product-img">
                            </a>
                        </div>
                        <div class="card-body-custom">
                            <h5 class="product-name">${product.name}</h5>
                            <div class="rating-row">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                                ${discountTag}
                            </div>
                            <div class="price-row">
                                <span class="price">${formatPrice(product.price)}</span>
                                <button class="buy-now-btn" data-id="${product._id}">
                                    <i class="fa-solid fa-cart-shopping cart-icon"></i> Buy now
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

  // DYNAMIC LOGIC (Runs AFTER fetch)
  function initializeShopLogic() {
    if (typeof Fancybox !== 'undefined') {
      Fancybox.bind('[data-fancybox="gallery"]', { infinite: true });
    }

    // Setup BUY NOW Functionality
    document.body.addEventListener('click', async (e) => {
      const buyBtn = e.target.closest('.buy-now-btn');
      if (!buyBtn) {
        return;
      }

      e.preventDefault();

      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        showToast('Please sign in to buy products.', 'error');
        return;
      }

      const productId = buyBtn.getAttribute('data-id');

      // Trigger the full-screen overlay loading animation ---
      showLoading();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const orderData = {
          orders: [
            {
              product_id: productId,
              size: '40', // for now for the data backend accept
              amount: 1,
            },
          ],
          address: 'sth sth somewhere', // for now for the data backend accept
        };

        const response = await fetch(API_URLS.ADD_TO_CART, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            accept: 'application/json',
          },
          body: JSON.stringify(orderData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Action failed with status: ${response.status}`);
        }

        // Hide the full-screen overlay when done ---
        hideLoading();

        // Still showing success on the button right before the redirect
        buyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Success';
        buyBtn.classList.replace('btn-outline-dark', 'btn-success');

        await fetchCartCount();

        setTimeout(() => {
          window.location.href = '../pages/cart.html';
        }, 500);
      } catch (error) {
        // Make sure the overlay hides if the request fails ---
        hideLoading();

        if (error.name === 'AbortError') {
          showToast('Request timed out after 3 seconds.', 'error');
        } else {
          showToast('Something went wrong adding to cart. Make sure data is valid.', 'error');
          console.error('Order Error:', error);
        }
      }
    });

    // Setup Like Functionality
    const productRow = document.getElementById('dynamic-product-row');
    if (productRow) {
      productRow.addEventListener('click', async (e) => {
        const heartBtn = e.target.closest('.btn-heart');
        if (!heartBtn) {
          return;
        }

        e.preventDefault();

        if (!sessionStorage.getItem('accessToken')) {
          showToast('Please sign in to like products.', 'error');
          return;
        }

        const productId = heartBtn.getAttribute('data-id');
        const isCurrentlyLiked = heartBtn.classList.contains('active');
        heartBtn.classList.toggle('active');

        const targetUrl = isCurrentlyLiked
          ? API_URLS.UNLIKE_PRODUCT(productId)
          : API_URLS.LIKE_PRODUCT(productId);

        try {
          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Action failed');
          }
          showToast(isCurrentlyLiked ? 'Removed from favorites' : 'Added to favorites');
        } catch (error) {
          heartBtn.classList.toggle('active');
          showToast('Something went wrong. Please try again.', 'error');
        }
      });
    }

    // Setup Pagination, Filters & Search
    const filterLinks = document.querySelectorAll('#category-filter .nav-link');
    const allProductItems = Array.from(document.querySelectorAll('.product-item'));
    const paginationContainer = document.getElementById('product-pagination');
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchIcon = document.querySelector('.search-icon');

    let filteredItems = [...allProductItems];
    let currentPage = 1;
    const itemsPerPage = 6;
    let currentCategory = 'all';
    let searchQuery = '';

    function displayProducts(page) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      allProductItems.forEach((item) => (item.style.display = 'none'));
      for (let i = startIndex; i < endIndex && i < filteredItems.length; i++) {
        filteredItems[i].style.display = '';
      }
    }

    function setupPagination() {
      if (!paginationContainer) {
        return;
      }
      paginationContainer.innerHTML = '';

      const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
      if (pageCount <= 1) {
        return;
      }

      const prevDisabled = currentPage === 1 ? 'disabled' : '';
      paginationContainer.innerHTML += `<li class="page-item ${prevDisabled}"><a class="page-link text-dark" href="#" data-page="prev">&lt;</a></li>`;

      for (let i = 1; i <= pageCount; i++) {
        const activeClass = currentPage === i ? 'active' : '';
        paginationContainer.innerHTML += `<li class="page-item ${activeClass}"><a class="page-link text-dark" href="#" data-page="${i}">${i}</a></li>`;
      }

      const nextDisabled = currentPage === pageCount ? 'disabled' : '';
      paginationContainer.innerHTML += `<li class="page-item ${nextDisabled}"><a class="page-link text-dark" href="#" data-page="next">&gt;</a></li>`;

      paginationContainer.querySelectorAll('.page-link').forEach((link) => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          if (this.parentElement.classList.contains('disabled')) {
            return;
          }

          const targetPage = this.getAttribute('data-page');
          if (targetPage === 'prev') {
            currentPage--;
          } else if (targetPage === 'next') {
            currentPage++;
          } else {
            currentPage = parseInt(targetPage);
          }

          displayProducts(currentPage);
          setupPagination();
        });
      });
    }

    function applyFilters() {
      filteredItems = allProductItems.filter((item) => {
        const itemCategory = item.getAttribute('data-category');
        const itemName = item.querySelector('.product-name').innerText.toLowerCase();

        const matchesCategory = currentCategory === 'all' || itemCategory === currentCategory;
        const matchesSearch = itemName.includes(searchQuery);

        return matchesCategory && matchesSearch;
      });

      currentPage = 1;
      displayProducts(currentPage);
      setupPagination();
    }

    if (filterLinks.length > 0) {
      filterLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          filterLinks.forEach((el) => el.classList.remove('active'));
          this.classList.add('active');

          currentCategory = this.getAttribute('data-filter');
          applyFilters();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
      });
    }

    const scrollToContainer = () => {
      if (productContainer) {
        productContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (searchInput) {
          searchQuery = searchInput.value.toLowerCase().trim();
          applyFilters();
        }
        scrollToContainer();
      });
    }

    if (searchIcon) {
      searchIcon.style.cursor = 'pointer';
      searchIcon.addEventListener('click', () => {
        if (searchInput) {
          searchQuery = searchInput.value.toLowerCase().trim();
          applyFilters();
        }
        scrollToContainer();
      });
    }

    if (allProductItems.length > 0) {
      applyFilters();
    }
  }

  fetchProducts();
});
