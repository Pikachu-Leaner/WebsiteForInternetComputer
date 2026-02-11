import { showToast } from '../js/validation.js';

const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const maleRadio = document.getElementById('male');
const femaleRadio = document.getElementById('female');
const profileForm = document.querySelector('.profileForm');
const loadingOverlay = document.getElementById('loading-overlay');
const authContainer = document.getElementById('auth-links-change-password');
const authLinkHide1 = document.getElementById('auth-links-login');
const authLinkHide2 = document.getElementById('auth-links-register');
const authLinkHide3 = document.getElementById('auth-links-menu-drop-down');

// Function to show/hide loading overlay
function toggleLoading(isLoading) {
  if (!loadingOverlay) return;

  if (isLoading) {
    loadingOverlay.classList.remove('d-none');
  } else {
    setTimeout(() => {
      loadingOverlay.classList.add('d-none');
    }, 200);
  }
}

// Kick back the a href link on nav
function handleAuthRouting(accessToken) {
  if (!authContainer) return;

  if (!accessToken) {
    // Not log in
    authContainer.innerHTML = ` `;
    authLinkHide3.classList.toggle('hide-link');
  } else {
    // Log in
    authContainer.innerHTML = `
    <a href="../pages/changePassword.html" class="register-link">Change password</a>
    `;
    authLinkHide1.classList.toggle('hide-link');
    authLinkHide2.classList.toggle('hide-link');

    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('accessToken');
        window.location.reload();
      };
    }
  }
}

// Get access token from session storage and check if usser is logged in or not ( technically without access token in sessio )
//( technically with/without access token in session storage will be seen as logged in/not )
async function getProfile() {
  const accessToken = sessionStorage.getItem('accessToken');

  handleAuthRouting(accessToken);

  // Check if user is logged in
  if (!accessToken) {
    toggleLoading(false);
    setTimeout(() => {
      showToast('You are not logged in!', 'error');
    }, 200);
    return;
  }

  try {
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/@me/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    // Success: status 201 ( don't show toast area since you already logged in)
    if (response.ok) {
      console.log('API Data Received:', result.data);
      populateForm(result.data);
    }
    // Failures: status 401
    else {
      if (response.status === 401) {
        showToast('You are not logged in!', 'error');
        sessionStorage.removeItem('accessToken');
      }
    }
  } catch (error) {
    showToast('Server connection failed.', 'error');
  } finally {
    toggleLoading(false);
  }
}

function populateForm(data) {
  if (!data) return;

  // Handle user data fields
  if (data.email) emailInput.value = data.email;
  if (data.username) nameInput.value = data.username;
  if (data.phone) phoneInput.value = data.phone;
  if (data.address) addressInput.value = data.address;

  // Handle Gender
  if (data.gender === true || data.gender === 'male' || data.gender === 'Male') {
    if (maleRadio) maleRadio.checked = true;
  } else {
    if (femaleRadio) femaleRadio.checked = true;
  }

  // Handle Avatar ( if have )
  if (data.avatar) {
    const avatarContainer = document.querySelector('.avatarContainer');
    if (avatarContainer) {
      avatarContainer.innerHTML = `<img src="${data.avatar}" alt="User Avatar" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">`;
    }
  }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  toggleLoading(true);
  getProfile();
});

// Form Submit
if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    window.location.href = '../pages/updateProfile.html';
  });
}
