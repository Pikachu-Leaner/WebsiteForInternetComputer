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
});
