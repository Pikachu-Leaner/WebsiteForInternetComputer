/* global Fancybox */
import { showToast } from '../js/validation.js';

// ===============================
// API Configuration
// ===============================

const API_URLS = {
  GET_PRODUCTS:
    'https://shoes-mall.onrender.com/api/v1/products?page=1&limit=8',

  GET_FAVORITES:
    'https://shoes-mall.onrender.com/api/v1/users/favorite',

  LIKE_PRODUCT: (productId) =>
    `https://shoes-mall.onrender.com/api/v1/products/${productId}/like`,

  UNLIKE_PRODUCT: (productId) =>
    `https://shoes-mall.onrender.com/api/v1/products/${productId}/unlike`,

  ADD_TO_CART:
    'https://shoes-mall.onrender.com/api/v1/orders/',

  GET_CART:
    'https://shoes-mall.onrender.com/api/v1/orders/',
};

// ===============================
// HELPERS
// ===============================

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// ===============================
// DOM READY
// ===============================

document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // AUTH DROPDOWN
  // ===============================

  const authDropdownMenu =
    document.getElementById('authDropdownMenu');

  const authDropdownToggle =
    document.getElementById('authDropdown');

  const accessToken =
    sessionStorage.getItem('accessToken');

  if (authDropdownMenu && authDropdownToggle) {

    if (accessToken) {

      authDropdownToggle.innerHTML = `
        <i class="fa fa-user user-icon me-2"></i>
        Favorite product
      `;

      authDropdownMenu.innerHTML = `
        <li>
          <a class="dropdown-item" href="profile.html">
            Profile
          </a>
        </li>

        <li>
          <hr class="dropdown-divider">
        </li>

        <li>
          <a
            class="dropdown-item text-danger"
            href="#"
            id="signOutBtn"
          >
            Sign out
          </a>
        </li>
      `;

      document
        .getElementById('signOutBtn')
        .addEventListener('click', (e) => {

          e.preventDefault();

          sessionStorage.removeItem('accessToken');

          window.location.reload();
        });

      fetchCartCount();

    } else {

      authDropdownMenu.innerHTML = `
        <li>
          <a class="dropdown-item" href="login.html">
            Sign in
          </a>
        </li>

        <li>
          <a class="dropdown-item" href="register.html">
            Sign up
          </a>
        </li>
      `;
    }
  }

  // ===============================
  // FETCH CART COUNT
  // ===============================

  async function fetchCartCount() {

    const token =
      sessionStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {

      const response = await fetch(
        API_URLS.GET_CART,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {

        const result = await response.json();

        let totalItems = 0;

        if (
          result.data &&
          Array.isArray(result.data)
        ) {

          totalItems = result.data.length;

        } else if (
          result.data &&
          Array.isArray(result.data.items)
        ) {

          totalItems = result.data.items.length;

        } else if (Array.isArray(result)) {

          totalItems = result.length;
        }

        const bagBadge =
          document.querySelector(
            '.bag-item .badge-count',
          );

        if (bagBadge) {
          bagBadge.innerText = totalItems;
        }
      }

    } catch (error) {

      console.error(
        'Error fetching cart count:',
        error,
      );
    }
  }

  // ===============================
  // GRID / LIST VIEW
  // ===============================

  const btnGridView =
    document.getElementById('btn-grid-view');

  const btnListView =
    document.getElementById('btn-list-view');

  const productContainer =
    document.getElementById('product-container');

  if (
    btnGridView &&
    btnListView &&
    productContainer
  ) {

    btnListView.addEventListener('click', () => {

      productContainer.classList.add('list-view');

      btnListView.classList.replace(
        'btn-outline-dark',
        'btn-dark',
      );

      btnGridView.classList.replace(
        'btn-dark',
        'btn-outline-dark',
      );
    });

    btnGridView.addEventListener('click', () => {

      productContainer.classList.remove('list-view');

      btnGridView.classList.replace(
        'btn-outline-dark',
        'btn-dark',
      );

      btnListView.classList.replace(
        'btn-dark',
        'btn-outline-dark',
      );
    });
  }

  // ===============================
  // BACK TO TOP
  // ===============================

  const backToTopBtn =
    document.getElementById('btn-back-to-top');

  let isBtnVisible = false;

  if (backToTopBtn) {

    window.addEventListener('scroll', () => {

      const scrollPos =
        document.body.scrollTop ||
        document.documentElement.scrollTop;

      if (scrollPos > 300) {

        if (!isBtnVisible) {

          backToTopBtn.style.display = 'block';

          backToTopBtn.classList.remove(
            'animate__fadeOutDown',
          );

          backToTopBtn.classList.add(
            'animate__fadeInUp',
          );

          isBtnVisible = true;
        }

      } else {

        if (isBtnVisible) {

          backToTopBtn.classList.remove(
            'animate__fadeInUp',
          );

          backToTopBtn.classList.add(
            'animate__fadeOutDown',
          );

          isBtnVisible = false;

          backToTopBtn.addEventListener(
            'animationend',
            function hideAfterAnimation() {

              if (!isBtnVisible) {
                backToTopBtn.style.display = 'none';
              }

              backToTopBtn.removeEventListener(
                'animationend',
                hideAfterAnimation,
              );
            },
          );
        }
      }
    });

    backToTopBtn.addEventListener('click', () => {

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  // ===============================
  // LOADING OVERLAY
  // ===============================

  let loadingInterval;

  function showLoading() {

    const overlay =
      document.getElementById('loading-overlay');

    const loadingText =
      document.getElementById('loading-text');

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

      loadingText.innerText =
        'Loading' + '.'.repeat(dots);

    }, 400);
  }

  function hideLoading() {

    const overlay =
      document.getElementById('loading-overlay');

    const loadingText =
      document.getElementById('loading-text');

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

  // ===============================
  // FETCH PRODUCTS
  // ===============================

  async function fetchProducts() {

    showLoading();

    try {

      let favoriteIds = [];

      const token =
        sessionStorage.getItem('accessToken');

      const requests = [

        fetch(API_URLS.GET_PRODUCTS, {
          method: 'GET',
          headers: {
            'Content-Type':
              'application/json',
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

      const responses =
        await Promise.all(requests);

      const productResponse =
        responses[0];

      if (!productResponse.ok) {
        throw new Error(
          'Failed to fetch products',
        );
      }

      if (
        responses[1] &&
        responses[1].ok
      ) {

        try {

          const favResult =
            await responses[1].json();

          if (favResult.data) {

            favoriteIds =
              favResult.data.map(
                (item) =>
                  item._id || item.id,
              );
          }

        } catch (err) {

          console.error(
            'Failed to parse favorites:',
            err,
          );
        }
      }

      const result =
        await productResponse.json();

      if (
        result.statusCode === 200 &&
        result.data &&
        result.data.items
      ) {

        const products =
          result.data.items;

        renderCarousel(
          products.slice(0, 4),
        );

        renderProductCards(
          products,
          favoriteIds,
        );

        initializeShopLogic();
      }

    } catch (error) {

      showToast(
        'Error fetching data: ' +
          error.message,
        'error',
      );

    } finally {

      hideLoading();
    }
  }

  // ===============================
  // RENDER CAROUSEL
  // ===============================

  function renderCarousel(products) {

    const carouselInner =
      document.getElementById(
        'dynamic-carousel-inner',
      );

    const carouselIndicators =
      document.getElementById(
        'dynamic-carousel-indicators',
      );

    if (
      !carouselInner ||
      !carouselIndicators
    ) {
      return;
    }

    let innerHTML = '';
    let indicatorsHTML = '';

    products.forEach(
      (product, index) => {

        const isActive =
          index === 0
            ? 'active'
            : '';

        indicatorsHTML += `
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="${index}"
            class="${isActive}"
            aria-current="${
              isActive ? 'true' : 'false'
            }"
            aria-label="Slide ${index + 1}">
          </button>
        `;

        innerHTML += `
          <div class="carousel-item ${isActive}">
            <img
              src="${product.images && product.images.length > 0 ? product.images[0].url : ''}"
              alt="${product.name}"
              class="d-block w-100"
            >
            <div class="carousel-caption d-none d-md-block">
              <h5>${product.name}</h5>
              <p>${formatPrice(product.price)}</p>
            </div>
          </div>
        `;
      },
    );

    carouselIndicators.innerHTML =
      indicatorsHTML;

    carouselInner.innerHTML =
      innerHTML;
  }

  // ===============================
  // RENDER PRODUCT CARDS
  // ===============================

  function renderProductCards(
    products,
    favoriteIds = [],
  ) {

    const productRow =
      document.getElementById(
        'dynamic-product-row',
      );

    if (!productRow) {
      return;
    }

    const cardsHTML = products
      .map((product) => {

        const imageUrl =
          product.images &&
          product.images.length > 0
            ? product.images[0].url
            : '';

        const brandSlug =
          product.brand
            ? product.brand.slug
            : 'other';

        const discountTag =
          product.discount > 0
            ? `
              <span class="Sale-item">
                SALE ${product.discount}%
              </span>
            `
            : '';

        const isLiked =
          favoriteIds.includes(
            product._id,
          );

        const heartClass =
          isLiked
            ? 'btn-heart active'
            : 'btn-heart';

        return `
          <div
            class="col-md-4 mb-4 product-item"
            data-category="${brandSlug}"
          >

            <div class="product-card">

              <div class="card-header-custom">

                <a
                  href="#"
                  class="${heartClass}"
                  data-id="${product._id}"
                >
                  <i class="fa fa-heart heart-icon"></i>
                </a>

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

                <div class="rating-row">
                  ${discountTag}
                </div>

                <div class="price-row">

                  <span class="price">
                    ${formatPrice(product.price)}
                  </span>

                  <button
                    class="buy-now-btn"
                    data-id="${product._id}"
                  >
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

  // ===============================
  // INITIALIZE SHOP LOGIC
  // ===============================

  function initializeShopLogic() {

    if (typeof Fancybox !== 'undefined') {

      Fancybox.bind(
        '[data-fancybox="gallery"]',
        {
          infinite: true,
        },
      );
    }

    // =================================================
    // YOUR BUY LOGIC HERE
    // =================================================

    // =================================================
    // YOUR FAVORITE LOGIC HERE
    // =================================================

    // =================================================
    // FIXED FILTER / SEARCH / PAGINATION
    // =================================================

    const filterLinks =
      document.querySelectorAll(
        '#category-nav .nav-link',
      );

    const paginationContainer =
      document.getElementById(
        'product-pagination',
      );

    const searchInput =
      document.getElementById(
        'search-input',
      );

    const searchForm =
      document.getElementById(
        'search-form',
      );

    const searchIcon =
      document.querySelector(
        '.search-icon',
      );

    let currentPage = 1;

    const itemsPerPage = 6;

    let currentCategory = 'all';

    let searchQuery = '';

    function getAllProductItems() {

      return Array.from(
        document.querySelectorAll(
          '.product-item',
        ),
      );
    }

    let filteredItems = [
      ...getAllProductItems(),
    ];

    // ===============================
    // DISPLAY PRODUCTS
    // ===============================

    function displayProducts(page) {

      const allProductItems =
        getAllProductItems();

      const startIndex =
        (page - 1) * itemsPerPage;

      const endIndex =
        startIndex + itemsPerPage;

      allProductItems.forEach(
        (item) => {
          item.style.display = 'none';
        },
      );

      for (
        let i = startIndex;
        i < endIndex &&
        i < filteredItems.length;
        i++
      ) {

        filteredItems[i].style.display =
          'block';
      }
    }

    // ===============================
    // PAGINATION
    // ===============================

    function setupPagination() {

      if (!paginationContainer) {
        return;
      }

      paginationContainer.innerHTML =
        '';

      const pageCount =
        Math.ceil(
          filteredItems.length /
            itemsPerPage,
        );

      if (pageCount <= 1) {
        return;
      }

      const prevDisabled =
        currentPage === 1
          ? 'disabled'
          : '';

      paginationContainer.innerHTML += `
        <li class="page-item ${prevDisabled}">
          <a
            class="page-link text-dark"
            href="#"
            data-page="prev"
          >
            &lt;
          </a>
        </li>
      `;

      for (
        let i = 1;
        i <= pageCount;
        i++
      ) {

        const activeClass =
          currentPage === i
            ? 'active'
            : '';

        paginationContainer.innerHTML += `
          <li class="page-item ${activeClass}">
            <a
              class="page-link text-dark"
              href="#"
              data-page="${i}"
            >
              ${i}
            </a>
          </li>
        `;
      }

      const nextDisabled =
        currentPage === pageCount
          ? 'disabled'
          : '';

      paginationContainer.innerHTML += `
        <li class="page-item ${nextDisabled}">
          <a
            class="page-link text-dark"
            href="#"
            data-page="next"
          >
            &gt;
          </a>
        </li>
      `;

      paginationContainer
        .querySelectorAll('.page-link')
        .forEach((link) => {

          link.addEventListener(
            'click',
            function (e) {

              e.preventDefault();

              if (
                this.parentElement.classList.contains(
                  'disabled',
                )
              ) {
                return;
              }

              const targetPage =
                this.dataset.page;

              if (
                targetPage === 'prev'
              ) {

                currentPage--;

              } else if (
                targetPage === 'next'
              ) {

                currentPage++;

              } else {

                currentPage =
                  parseInt(targetPage);
              }

              displayProducts(
                currentPage,
              );

              setupPagination();
            },
          );
        });
    }

    // ===============================
    // APPLY FILTERS
    // ===============================

    function applyFilters() {

      const allProductItems =
        getAllProductItems();

      filteredItems =
        allProductItems.filter(
          (item) => {

            const itemCategory =
              item
                .getAttribute(
                  'data-category',
                )
                ?.toLowerCase() ||
              '';

            const itemName =
              item
                .querySelector(
                  '.product-name',
                )
                ?.innerText.toLowerCase() ||
              '';

            const matchesCategory =
              currentCategory ===
                'all' ||
              itemCategory ===
                currentCategory;

            const matchesSearch =
              itemName.includes(
                searchQuery,
              );

            return (
              matchesCategory &&
              matchesSearch
            );
          },
        );

      currentPage = 1;

      displayProducts(currentPage);

      setupPagination();
    }

    // ===============================
    // CATEGORY FILTER
    // ===============================

    if (filterLinks.length > 0) {

      filterLinks.forEach(
        (link) => {

          link.addEventListener(
            'click',
            function (e) {

              e.preventDefault();

              filterLinks.forEach(
                (el) => {

                  el.classList.remove(
                    'active',
                  );
                },
              );

              this.classList.add(
                'active',
              );

              currentCategory =
                this.dataset.filter.toLowerCase();

              applyFilters();
            },
          );
        },
      );
    }

    // ===============================
    // SEARCH INPUT
    // ===============================

    if (searchInput) {

      searchInput.addEventListener(
        'input',
        (e) => {

          searchQuery =
            e.target.value
              .toLowerCase()
              .trim();

          applyFilters();
        },
      );
    }

    // ===============================
    // SEARCH FORM
    // ===============================

    const scrollToContainer =
      () => {

        if (productContainer) {

          productContainer.scrollIntoView(
            {
              behavior: 'smooth',
              block: 'start',
            },
          );
        }
      };

    if (searchForm) {

      searchForm.addEventListener(
        'submit',
        (e) => {

          e.preventDefault();

          if (searchInput) {

            searchQuery =
              searchInput.value
                .toLowerCase()
                .trim();

            applyFilters();
          }

          scrollToContainer();
        },
      );
    }

    // ===============================
    // SEARCH ICON
    // ===============================

    if (searchIcon) {

      searchIcon.style.cursor =
        'pointer';

      searchIcon.addEventListener(
        'click',
        () => {

          if (searchInput) {

            searchQuery =
              searchInput.value
                .toLowerCase()
                .trim();

            applyFilters();
          }

          scrollToContainer();
        },
      );
    }

    // ===============================
    // INITIAL LOAD
    // ===============================

    if (
      getAllProductItems().length > 0
    ) {

      applyFilters();
    }
  }

  // ===============================
  // START
  // ===============================

  fetchProducts();
});