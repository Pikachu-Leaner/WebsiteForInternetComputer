import { showToast } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const productGrid = document.getElementById('favorite-product-grid');
  const productCountText = document.getElementById('product-count');
  const searchInput = document.getElementById('product-search-input');
  const filterButtons = document.querySelectorAll('.custom-filter-chip');
  const paginationContainer = document.getElementById('pagination-container');
  const viewToggleGroup = document.querySelector('.custom-view-toggle');
  const refreshBtn = document.getElementById('btn-refresh-favorites');

  // Search Icons
  const clearSearchBtn = document.getElementById('clear-search');
  const mainSearchIcon = document.getElementById('main-search-icon');

  // State Management
  let allFavorites = [];
  let filteredFavorites = [];
  let currentPage = 1;
  const itemsPerPage = 8;
  let currentView = 'list';
  let currentBrand = 'all';
  let searchTimeout = null;
  let isProcessing = false; // Prevents overlapping loading states

  // Helper function for artificial delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper to show loading spinner
  function showLoadingSpinner(message = 'Processing...') {
    if (!productGrid) return;
    productGrid.className = 'row'; // Reset grid classes during loading
    productGrid.innerHTML = `
      <div class="container col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem; color: #8e4beb !important;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted fw-bold">${message}</p>
      </div>`;
  }

  // Initialization

  function initUI() {
    filterButtons.forEach((btn) => {
      if (btn.innerText.trim().toLowerCase().includes('all')) {
        btn.classList.add('custom-active-bg-purple', 'text-white');
        btn.classList.remove('btn-outline-secondary', 'btn-light');
      } else {
        btn.classList.remove('custom-active-bg-purple', 'text-white');
        btn.classList.add('btn-outline-secondary');
      }
    });

    if (viewToggleGroup) {
      const btns = viewToggleGroup.querySelectorAll('.btn');
      if (btns.length >= 2) {
        btns[0].classList.add('custom-active-bg-purple');
        btns[0].classList.remove('btn-light');
        btns[1].classList.remove('custom-active-bg-purple');
        btns[1].classList.add('btn-light');
      }
    }
  }

  // Data Fetching

  async function fetchFavoriteProducts(forceReload = false) {
    if (isProcessing) return;

    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '../pages/login.html';
      return;
    }

    isProcessing = true;
    showLoadingSpinner(forceReload ? 'Refreshing your favorites...' : 'Loading your favorites...');

    try {
      await delay(2500);

      const res = await fetch('https://shoes-mall.onrender.com/api/v1/users/favorite', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || 'Failed to fetch data');

      allFavorites = responseData.data || [];
      sessionStorage.setItem('favoriteProductsCache', JSON.stringify(allFavorites));
      applyFiltersAndRender();

      if (forceReload) {
        showToast('Favorites refreshed successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
      if (productGrid) {
        productGrid.innerHTML = `<div class="container col-12 text-center py-5 text-danger">Failed to load favorites.</div>`;
      }
    } finally {
      isProcessing = false;
    }
  }

  // Filtering & Rendering

  async function handleUIInteraction(actionType) {
    if (isProcessing) return;
    isProcessing = true;

    let msg = 'Updating...';
    if (actionType === 'filter') msg = 'Filtering products...';
    if (actionType === 'view') msg = 'Switching view...';
    if (actionType === 'search') msg = 'Searching...';

    showLoadingSpinner(msg);
    await delay(2000);
    applyFiltersAndRender();

    isProcessing = false;
  }

  function applyFiltersAndRender() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    filteredFavorites = allFavorites.filter((p) => {
      const name = p.name.toLowerCase();
      const matchesSearch = name.includes(searchTerm);
      let matchesBrand =
        currentBrand === 'all'
          ? true
          : currentBrand === 'other'
            ? !name.includes('nike') && !name.includes('adidas') && !name.includes('vans')
            : name.includes(currentBrand);
      return matchesSearch && matchesBrand;
    });

    // Logic Check Fix: Ensure current page doesn't exceed total pages after filtering/deleting
    const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    renderPagination();
    renderCurrentPage();
  }

  function renderCurrentPage() {
    if (!productGrid) return;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredFavorites.slice(startIndex, startIndex + itemsPerPage);

    if (productCountText) productCountText.textContent = `(${filteredFavorites.length} items)`;

    productGrid.innerHTML = '';
    productGrid.className =
      currentView === 'list'
        ? 'row row-cols-1 g-3'
        : 'row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4';

    if (pageItems.length === 0) {
      productGrid.innerHTML = `
                <div class="container text-center py-5">
                    <i class="fas fa-heart-broken text-muted fa-3x mb-3 opacity-50"></i>
                    <p class="text-muted fw-bold fs-5">No products found.</p>
                </div>`;
      return;
    }

    pageItems.forEach((p) =>
      productGrid.insertAdjacentHTML('beforeend', generateCardHTML(p, currentView))
    );
    attachHeartListeners();
  }

  function renderPagination() {
    if (!paginationContainer) return;

    if (filteredFavorites.length === 0) {
      paginationContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage) || 1;
    paginationContainer.innerHTML = '<span class="custom-pages-text me-2 fw-bold">Page</span>';

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      if (i === currentPage) {
        btn.className = 'btn btn-sm mx-1 text-white shadow-sm';
        btn.style.backgroundColor = '#8e4beb';
        btn.style.borderColor = '#8e4beb';
      } else {
        btn.className = 'btn btn-sm mx-1 btn-light border';
      }
      btn.textContent = i;
      btn.onclick = () => {
        if (isProcessing) return; // Prevent page changes while loading
        currentPage = i;
        renderCurrentPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      paginationContainer.appendChild(btn);
    }
  }

  function generateCardHTML(product, view) {
    const brand = product.name.toLowerCase();
    let themeClass = brand.includes('nike')
      ? 'pink-theme'
      : brand.includes('adidas')
        ? 'tan-theme'
        : brand.includes('vans')
          ? 'green-theme'
          : 'blue-theme';

    const imageUrl = product.images?.[0]?.url || '';
    const rating = product.totalRatings || 0;
    const reviewsCount = product.numberOfReview || 0;
    const productId = product._id || '';
    const price = parseFloat(product.price || 0).toFixed(2);
    const discount = product.discount || 0;
    const sold = product.sold || 0;
    const quantity = product.quantity || 0;
    const description = product.description || '';

    const discountBadge =
      discount > 0
        ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2 fav-badge-discount">-${discount}%</span>`
        : '';
    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${product.name}" class="img-fluid fav-product-img" style="max-height: 150px; object-fit: contain;">`
      : `<div class="text-muted d-flex flex-column align-items-center justify-content-center fav-no-image"><i class="fas fa-image fa-2x mb-1 opacity-50"></i>No Image</div>`;

    if (view === 'list') {
      return `
            <div class="col favorite-product-placeholder ${themeClass}">
                <div class="generic-product-card p-3 d-flex align-items-center border rounded bg-white h-100 fav-card-wrapper shadow-sm">
                    <div class="position-relative text-center me-4" style="width: 150px; flex-shrink: 0;">${discountBadge}${imageElement}</div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="fw-bold mb-1 text-dark text-truncate" title="${product.name}">${product.name}</h5>
                            <span class="rating-badge p-1 px-2 rounded-pill bg-light shadow-sm fav-badge-rating" style="font-size: 0.85rem;">
                                <i class="fas fa-star text-warning me-1"></i>${rating} <span class="text-muted fw-normal" style="font-size: 0.7rem;">(${reviewsCount})</span>
                            </span>
                        </div>
                        <p class="text-muted small mb-2 fav-text-desc text-truncate" style="max-width: 400px;" title="${description}">${description}</p>
                        <div class="d-flex align-items-center gap-4 mb-3 small fav-text-stats flex-wrap">
                            <span class="text-muted">Sold: <span class="fw-bold text-dark">${sold}</span></span>
                            <span class="text-muted">Stock: <span class="fw-bold text-dark">${quantity}</span></span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <p class="card-price text-dark fw-bold mb-0 fs-5">$${price}</p>
                            <button class="btn btn-light rounded-circle p-2 shadow-sm btn-icon-circle-md btn-heart active" data-id="${productId}">
                                <i class="fa fa-heart heart-icon"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    return `
        <div class="col favorite-product-placeholder ${themeClass}">
            <div class="generic-product-card p-3 h-100 fav-card-wrapper border rounded shadow-sm bg-white">
                <div class="card-header-overlay position-relative mb-3 text-center fav-card-img-header">
                    <span class="rating-badge position-absolute top-0 start-0 m-2 p-1 px-2 rounded-pill bg-white shadow-sm fav-badge-rating">
                        <i class="fas fa-star text-warning me-1"></i>${rating} 
                    </span>
                    ${discountBadge}
                    <div class="product-silhouette-placeholder mx-auto d-flex align-items-center justify-content-center h-100 position-relative" style="height: 150px;">
                        ${imageElement}
                    </div>
                </div>
                <div class="card-body-overlay mt-2">
                    <h5 class="card-title text-dark fs-6 fw-bold mb-1 text-truncate" title="${product.name}">${product.name}</h5>
                    <p class="card-text text-secondary mb-1 fav-text-desc text-truncate" title="${description}">${description}</p>
                    <div class="d-flex align-items-center mb-2 fav-text-stats gap-2 flex-wrap">
                        <span class="text-muted">Sold: <span class="fw-bold text-dark">${sold}</span></span>
                        <span class="text-muted">Stock: <span class="fw-bold text-dark">${quantity}</span></span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <p class="card-price text-dark fw-bold mb-0 fs-5">$${price}</p>
                        <button class="btn btn-light rounded-circle p-2 shadow-sm btn-icon-circle-md btn-heart active" data-id="${productId}">
                            <i class="fa fa-heart heart-icon"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
  }

  // Event Listeners

  searchInput.addEventListener('input', () => {
    const text = searchInput.value.trim();
    if (clearSearchBtn) clearSearchBtn.style.display = text ? 'inline-block' : 'none';
    if (mainSearchIcon) mainSearchIcon.style.display = text ? 'none' : 'inline-block';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      // Bypassing the isProcessing lock just for search initiation so users
      // aren't blocked from searching if a previous animation is ending
      isProcessing = false;
      handleUIInteraction('search');
    }, 400);
  });

  if (clearSearchBtn) {
    clearSearchBtn.onclick = () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      mainSearchIcon.style.display = 'inline-block';
      currentPage = 1;
      isProcessing = false;
      handleUIInteraction('search');
      searchInput.focus();
    };
  }

  filterButtons.forEach((btn) => {
    btn.onclick = function () {
      if (isProcessing) return;

      filterButtons.forEach((b) => {
        b.classList.remove('custom-active-bg-purple', 'text-white');
        b.classList.add('btn-outline-secondary');
      });
      this.classList.add('custom-active-bg-purple', 'text-white');
      this.classList.remove('btn-outline-secondary', 'btn-light');

      currentBrand = this.innerText.toLowerCase().includes('all')
        ? 'all'
        : this.innerText.toLowerCase().trim();
      currentPage = 1;
      handleUIInteraction('filter');
    };
  });

  if (viewToggleGroup) {
    const btns = viewToggleGroup.querySelectorAll('.btn');
    btns.forEach((btn, idx) => {
      btn.onclick = () => {
        if (isProcessing) return;

        currentView = idx === 0 ? 'list' : 'grid';
        btns.forEach((b) => {
          b.classList.remove('custom-active-bg-purple');
          b.classList.add('btn-light');
        });
        btn.classList.add('custom-active-bg-purple');
        btn.classList.remove('btn-light');
        handleUIInteraction('view');
      };
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (isProcessing) return;

      const icon = refreshBtn.querySelector('i');
      if (icon) icon.classList.add('fa-spin');

      fetchFavoriteProducts(true).finally(() => {
        if (icon) icon.classList.remove('fa-spin');
      });
    });
  }

  function attachHeartListeners() {
    productGrid.querySelectorAll('.btn-heart').forEach((btn) => {
      btn.onclick = async function () {
        if (isProcessing) return;

        const productId = this.getAttribute('data-id');
        const token = sessionStorage.getItem('accessToken');

        if (!token) {
          showToast('Your session expired. Please log in again.', 'error');
          window.location.href = '../pages/login.html';
          return;
        }

        isProcessing = true;
        showLoadingSpinner('Updating your favorites...');

        try {
          await delay(2000);

          const postUrl = `https://shoes-mall.onrender.com/api/v1/products/${productId}/unlike`;
          const postResponse = await fetch(postUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!postResponse.ok) {
            const errData = await postResponse.json();
            throw new Error(errData.message || 'Unlike failed.');
          }

          allFavorites = allFavorites.filter((p) => p._id !== productId);
          sessionStorage.setItem('favoriteProductsCache', JSON.stringify(allFavorites));

          applyFiltersAndRender();
          showToast('Successfully removed from favorites.', 'success');
        } catch (error) {
          showToast(error.message, 'error');
          renderCurrentPage();
        } finally {
          isProcessing = false;
        }
      };
    });
  }

  // Start App
  initUI();
  fetchFavoriteProducts();
});
