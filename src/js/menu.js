// Fancybox initialization for the gallery
document.addEventListener('DOMContentLoaded', () => {
  // Find all images on the page
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const parentLink = img.closest('a');
    const imgSrc = img.getAttribute('src');

    // Check if this image is a logo (based on its class name)
    const isLogo = img.classList.contains('img-logo') || img.classList.contains('img-logo-footer');

    // Only proceed if the image has a valid URL AND is NOT a logo
    if (parentLink && imgSrc && imgSrc.trim() !== '' && !isLogo) {
      // If the <a> tag has an empty href (or "#"), fix it by giving it the image's src
      const linkHref = parentLink.getAttribute('href');
      if (!linkHref || linkHref.trim() === '' || linkHref === '#') {
        parentLink.setAttribute('href', imgSrc);
      }

      // Add Fancybox attributes ONLY to valid product images
      parentLink.setAttribute('data-fancybox', 'gallery');

      // Use the image's 'alt' attribute as the caption
      if (img.alt && img.alt.trim() !== '') {
        parentLink.setAttribute('data-caption', img.alt);
      }
    }
  });

  // Initialize Fancybox
  Fancybox.bind('[data-fancybox="gallery"]', {
    infinite: true, // Allows users to loop through the gallery endlessly
  });

  // Dropdown menu functionality for authentication links
  const authDropdownMenu = document.getElementById('authDropdownMenu');
  const authDropdownToggle = document.getElementById('authDropdown');

  // Check if the user is logged in by looking for the token
  const accessToken = sessionStorage.getItem('accessToken');

  // Make sure the dropdown elements actually exist on the page before modifying them
  if (authDropdownMenu && authDropdownToggle) {
    if (accessToken) {
      // STATE: LOGGED IN
      authDropdownToggle.innerHTML = '<i class="fa fa-user user-icon me-2"></i> My Account';

      // Render Logged In menu items
      authDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#">Profile</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" id="signOutBtn">Sign out</a></li>
            `;

      // Add the logout functionality to the "Sign out" button
      document.getElementById('signOutBtn').addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('accessToken'); // Delete the token
        window.location.reload(); // Refresh the page to show the "Hello" state
      });
    } else {
      // STATE: NOT LOGGED IN (GUEST)
      authDropdownToggle.innerHTML = '<i class="fa fa-user user-icon me-2"></i> Hello';

      // Render Guest menu items
      authDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#">Sign in</a></li>
                <li><a class="dropdown-item" href="#">Sign up</a></li>
            `;
    }
  }

  // Grid/List view toggle functionality
  const btnGridView = document.getElementById('btn-grid-view');
  const btnListView = document.getElementById('btn-list-view');
  const productContainer = document.getElementById('product-container');

  if (btnGridView && btnListView && productContainer) {
    // When LIST button is clicked
    btnListView.addEventListener('click', () => {
      productContainer.classList.add('list-view'); // Apply list layout

      // Make List active, Grid inactive
      btnListView.classList.replace('btn-outline-dark', 'btn-dark');
      btnGridView.classList.replace('btn-dark', 'btn-outline-dark');
    });

    // When GRID button is clicked
    btnGridView.addEventListener('click', () => {
      productContainer.classList.remove('list-view'); // Remove list layout

      // Make Grid active, List inactive
      btnGridView.classList.replace('btn-outline-dark', 'btn-dark');
      btnListView.classList.replace('btn-dark', 'btn-outline-dark');
    });
  }

  // Category Filter functionality
  const filterLinks = document.querySelectorAll('#category-filter .nav-link');
  const allProductItems = Array.from(document.querySelectorAll('.product-item')); // Get all products as an Array
  const paginationContainer = document.getElementById('product-pagination');

  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');

  let filteredItems = [...allProductItems]; // Array to store currently filtered products
  let currentPage = 1; // Start on page 1
  const itemsPerPage = 6; // Set how many items you want per page

  let currentCategory = 'all';
  let searchQuery = '';

  // Display only the products for the current page
  function displayProducts(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // First, hide ALL products
    allProductItems.forEach((item) => {
      item.style.display = 'none';
    });

    // Then, show only the products within the current page range
    for (let i = startIndex; i < endIndex && i < filteredItems.length; i++) {
      filteredItems[i].style.display = '';
    }
  }

  // Generate the pagination buttons (1, 2, 3...)
  function setupPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = ''; // Clear old buttons

    const pageCount = Math.ceil(filteredItems.length / itemsPerPage);

    // If there is only 1 page (or 0 products), hide the pagination
    if (pageCount <= 1) return;

    // Render Previous (<) button
    let prevDisabled = currentPage === 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `<li class="page-item ${prevDisabled}"><a class="page-link text-dark" href="#" data-page="prev">&lt;</a></li>`;

    // Render page numbers (1, 2, 3...)
    for (let i = 1; i <= pageCount; i++) {
      let activeClass = currentPage === i ? 'active' : '';
      paginationContainer.innerHTML += `<li class="page-item ${activeClass}"><a class="page-link text-dark" href="#" data-page="${i}">${i}</a></li>`;
    }

    // Render Next (>) button
    let nextDisabled = currentPage === pageCount ? 'disabled' : '';
    paginationContainer.innerHTML += `<li class="page-item ${nextDisabled}"><a class="page-link text-dark" href="#" data-page="next">&gt;</a></li>`;

    // Add click events to the newly created pagination buttons
    const pageLinks = paginationContainer.querySelectorAll('.page-link');
    pageLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();

        // Prevent clicking if the button is disabled
        if (this.parentElement.classList.contains('disabled')) return;

        const targetPage = this.getAttribute('data-page');

        if (targetPage === 'prev') {
          currentPage--;
        } else if (targetPage === 'next') {
          currentPage++;
        } else {
          currentPage = parseInt(targetPage);
        }

        displayProducts(currentPage); // Update the products shown
        setupPagination(); // Re-render the pagination (to update the active button color)
      });
    });
  }

  // Initialize on page load
  if (allProductItems.length > 0) {
    displayProducts(currentPage);
    setupPagination();
  }

  // Handle Category Filter Clicks
  if (filterLinks.length > 0) {
    filterLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();

        // Change the active color on the filter menu
        filterLinks.forEach((el) => el.classList.remove('active'));
        this.classList.add('active');

        // Get the category to filter by
        const filterValue = this.getAttribute('data-filter');

        // Update the `filteredItems` array based on the selected category
        if (filterValue === 'all') {
          filteredItems = [...allProductItems];
        } else {
          filteredItems = allProductItems.filter(
            (item) => item.getAttribute('data-category') === filterValue
          );
        }

        // Always reset to Page 1 when changing categories
        currentPage = 1;
        displayProducts(currentPage);
        setupPagination();
      });
    });
  }

  // Search Bar + filter functionality
  function applyFilters() {
    filteredItems = allProductItems.filter((item) => {
      const itemCategory = item.getAttribute('data-category');
      const itemNameElement = item.querySelector('.product-name');
      const itemName = itemNameElement ? itemNameElement.innerText.toLowerCase() : '';

      const matchesCategory = currentCategory === 'all' || itemCategory === currentCategory;
      const matchesSearch = itemName.includes(searchQuery);

      return matchesCategory && matchesSearch;
    });

    currentPage = 1; // Reset to page 1 on new search/filter
    displayProducts(currentPage);
    setupPagination();
  }

  // Listen for Category Button Clicks
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

  // Listen for Search Bar Typing
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Prevent page reload on "Enter" key AND scroll down
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Scroll smoothly to the product container
      if (productContainer) {
        productContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Make the Search Icon clickable and scroll down
  const searchIcon = document.querySelector('.search-icon');
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer'; // Changes mouse to a pointer (hand) so users know it's clickable

    searchIcon.addEventListener('click', function () {
      // Optional: Update the search query just in case they typed without triggering 'input'
      if (searchInput) {
        searchQuery = searchInput.value.toLowerCase().trim();
        applyFilters();
      }

      // Scroll smoothly to the product container
      if (productContainer) {
        productContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Initialize on first load
  if (allProductItems.length > 0) {
    applyFilters();
  }
});
