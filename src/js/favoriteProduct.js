import { showToast } from '../js/validation.js';
document.addEventListener('DOMContentLoaded', () => {
  // Target the specific containers in your HTML
  const productGrid = document.getElementById('favorite-product-grid');
  const productCountText = document.getElementById('product-count');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Fetch Favorite Products from API
  async function fetchFavoriteProducts() {
    // Retrieve the access token from session storage
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      console.error('No access token found. Please log in.');
      // Optional: Redirect the user to login.html here
      return;
    }

    // Check for catched data
    let hasCachedData = false;
    const cachedProducts = sessionStorage.getItem('favoriteProductsCache');

    if (cachedProducts) {
      try {
        const parsedCache = JSON.parse(cachedProducts);
        renderProducts(parsedCache); // Render instantly
        hasCachedData = true;
      } catch (e) {
        console.warn('Failed to parse cached products. Fetching fresh data.');
      }
    }

    try {
      // Show the loading spinner while fetching data + can't catch the data
      if (!hasCachedData && productGrid) {
        productGrid.innerHTML = `
                    <div class="col-12 section-loader-container">
                        <div class="spinner-border custom-spinner" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3 text-muted fw-bold" style="font-size: 1.1rem;">Loading your favorites...</p>
                    </div>
                `;
      }

      const apiUrl = 'https://shoes-mall.onrender.com/api/v1/users/favorite';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      // Success
      if (!response.ok) {
        // If it fails, throw the backend's specific error message to the catch block
        const errorMessage = responseData.message || 'An unexpected error occurred.';
        throw new Error(errorMessage);
      }

      const products = responseData.data || [];
      sessionStorage.setItem('favoriteProductsCache', JSON.stringify(products));
      renderProducts(products);

      if (!hasCachedData && responseData.message) {
        showToast(responseData.message, 'success');
      }
    } catch (error) {
      console.error('Error fetching favorite products:', error);

      // If we have cached data, don't break the UI. Just show a toast warning.
      if (hasCachedData) {
        showToast('Could not sync latest favorites. Showing offline data.', 'error');
      }
      // Error
      else {
        // If no cache exists, show the error UI in the grid
        showToast(error.message, 'error');
        if (productGrid) {
          productGrid.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
                            <p class="text-danger fw-bold fs-5">Failed to load favorites</p>
                        </div>
                    `;
        }
      }
    }
  }

  // Product Card Component Generator
  function generateCardHTML(product) {
    // Determine the theme color based on the brand_id or name
    let themeClass = 'blue-theme';
    const brandString = (product.brand_id || product.name || '').toLowerCase();

    if (brandString.includes('nike')) {
      themeClass = 'pink-theme';
    } else if (brandString.includes('adidas')) {
      themeClass = 'tan-theme';
    } else if (brandString.includes('vans')) {
      themeClass = 'green-theme';
    }

    // Get datas from backend response, with fallbacks for missing data

    // Check for images, fallback to a "No Image" placeholder if missing
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
    const rating = product.totalRatings || 0;
    const reviewsCount = product.numberOfReview || 0;

    // Exact fields from the schema
    const price = parseFloat(product.price || 0).toFixed(2);
    const discount = product.discount || 0;
    const sold = product.sold || 0;
    const quantity = product.quantity || 0; // Stock quantity
    const description = product.description || '';
    const brandDisplay = product.brand_id ? `Brand: ${product.brand_id}` : 'Shoes';

    // Discount Badge Element
    const discountBadge =
      discount > 0
        ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="z-index: 5;">-${discount}%</span>`
        : '';

    // Image Element Fallback
    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${product.name}" class="img-fluid" style="max-height: 80px; z-index: 2; position: relative;">`
      : `<div class="text-muted d-flex flex-column align-items-center justify-content-center" style="z-index: 2; font-size: 0.8rem;"><i class="fas fa-image fa-2x mb-1 opacity-50"></i>No Image</div>`;

    return `
            <div class="col favorite-product-placeholder ${themeClass}">
                <div class="generic-product-card p-3 h-100" style="border-radius: 1.25rem;">
                    
                    <div class="card-header-overlay position-relative mb-3 text-center" style="height: 120px; border-radius: 1rem; overflow: hidden;">
                        
                        <span class="rating-badge position-absolute top-0 start-0 m-2 p-1 px-2 rounded-pill bg-white shadow-sm" style="font-size: 0.8rem; font-weight: bold; z-index: 5;">
                            <i class="fas fa-star text-warning me-1"></i>${rating} 
                            <span class="text-muted fw-normal" style="font-size: 0.7rem;">(${reviewsCount})</span>
                        </span>

                        ${discountBadge}
                        
                        <div class="product-silhouette-placeholder mx-auto d-flex align-items-center justify-content-center h-100 position-relative">
                            ${imageElement}
                        </div>
                    </div>
                    
                    <div class="card-body-overlay mt-2">
                        <h5 class="card-title text-dark fs-6 fw-bold mb-1 text-truncate" title="${product.name}">${product.name}</h5>
                        <p class="card-text text-muted mb-1" style="font-size: 0.85rem;">${brandDisplay}</p>
                        
                        <p class="card-text text-secondary mb-1" style="font-size: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${description}">
                            ${description}
                        </p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted" style="font-size: 0.75rem;">Sold: <span class="fw-bold text-dark">${sold}</span></span>
                            <span class="text-muted" style="font-size: 0.75rem;">Stock: <span class="fw-bold text-dark">${quantity}</span></span>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <p class="card-price text-dark fw-bold mb-0 fs-5">$${price}</p>
                            <button class="btn btn-light rounded-circle p-2 shadow-sm" style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-heart text-danger"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;
  }

  // Render Logic & Product Count
  function renderProducts(products) {
    if (!productGrid) return;

    // Clear out the loading spinner or previous products
    productGrid.innerHTML = '';
    let htmlContent = '';

    // Handle the case where the user has no favorites
    if (products.length === 0) {
      productGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-heart-broken text-muted fa-3x mb-3 opacity-50"></i>
            <p class="text-muted fw-bold fs-5">You haven't favorited any products yet.</p>
        </div>
      `;
    } else {
      // Loop through the data and build the HTML string
      products.forEach((product) => {
        htmlContent += generateCardHTML(product);
      });

      // Inject the generated HTML into the DOM
      productGrid.innerHTML = htmlContent;
    }

    // Dynamically update the product count text in the header
    if (productCountText) {
      productCountText.textContent = `(${products.length} items)`;
    }
  }

  // Initialization
  fetchFavoriteProducts();
});
