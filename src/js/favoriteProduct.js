// Product Card Component Generator
function generateCardHTML(product) {
  // Determine the theme color based on the category/brand
  let themeClass = 'blue-theme'; // Defaults to "Other"

  // Convert to lowercase just to be safe and catch variations like "NIKE" or "nike"
  const categoryName = (product.category || '').toLowerCase();

  if (categoryName.includes('nike')) {
    themeClass = 'pink-theme';
  } else if (categoryName.includes('adidas')) {
    themeClass = 'tan-theme';
  } else if (categoryName.includes('vans')) {
    themeClass = 'green-theme';
  }

  // Return the HTML for the card
  return `
        <div class="col favorite-product-placeholder ${themeClass}">
            <div class="generic-product-card p-3 h-100" style="border-radius: 1.25rem;">
                
                <div class="card-header-overlay position-relative mb-3 text-center" style="height: 120px; border-radius: 1rem; overflow: hidden;">
                    
                    <span class="rating-badge position-absolute top-0 start-0 m-2 p-1 px-2 rounded-pill bg-white shadow-sm" style="font-size: 0.8rem; font-weight: bold; z-index: 5;">
                        <i class="fas fa-star text-warning me-1"></i>${product.rating || '0.0'}
                    </span>
                    
                    <div class="product-silhouette-placeholder mx-auto d-flex align-items-center justify-content-center h-100 position-relative">
                        <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid" style="max-height: 80px; z-index: 2; position: relative;">
                    </div>
                </div>
                
                <div class="card-body-overlay mt-2">
                    <h5 class="card-title text-dark fs-6 fw-bold mb-1">${product.name}</h5>
                    <p class="card-text text-muted mb-2" style="font-size: 0.85rem;">${product.category}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <p class="card-price text-dark fw-bold mb-0 fs-5">$${parseFloat(product.price).toFixed(2)}</p>
                        <button class="btn btn-light rounded-circle p-2 shadow-sm" style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-heart text-danger"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;
}
