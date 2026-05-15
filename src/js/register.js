import { validateForm, showToast, setupPasswordToggle } from '../js/validation.js';

// Setup password visibility toggles
setupPasswordToggle('password');
setupPasswordToggle('passwordConfirm');

const loadingOverlay = document.getElementById('loading-overlay');
const registerForm = document.getElementById('register');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const maleInput = document.getElementById('male');
const femaleInput = document.getElementById('female');
let submitAttempts = 0;
const maxAttempts = 6;
const cooldownTime = 5000;

// Function to enable/disable all form inputs and buttons
function toggleFormInput(isDisabled) {
  const formElements = registerForm.querySelectorAll('input, button');
  formElements.forEach((element) => {
    element.disabled = isDisabled;
  });
}

// Function to reset error messages after failed attempt
function resetErrors() {
  const errorDivs = document.querySelectorAll('.validation-register');
  errorDivs.forEach((div) => {
    div.innerText = '';
    div.style.display = 'none';
  });
}

function handleServerErrors(data) {
  const message = data.message || 'An error occurred';
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('email')) {
    showError('email_error', message);
  } else if (lowerMsg.includes('password')) {
    showError('password_error', message);
  } else if (lowerMsg.includes('phone')) {
    showError('phone_error', message);
  } else if (lowerMsg.includes('name')) {
    showError('name_error', message);
  }
}

// Helper to show error on a specific ID
function showError(elementId, message) {
  const errorDiv = document.getElementById(elementId);
  if (errorDiv) {
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'red';
  }
}

// Helper to map Client Validation object to HTML IDs
function showClientErrors(errors) {
  if (errors.email) {
    showError('email_error', errors.email);
  }
  if (errors.password) {
    showError('password_error', errors.password);
  }
  if (errors.passwordConfirm) {
    showError('password_confirm_error', errors.passwordConfirm);
  }
  if (errors.name) {
    showError('name_error', errors.name);
  }
  if (errors.phone) {
    showError('phone_error', errors.phone);
  }
  if (errors.gender) {
    showError('gender-error', errors.gender);
  }
}

registerForm.addEventListener('submit', async (event) => {
  // Stop page reload
  event.preventDefault();

  // Submit attempt limit check
  if (submitAttempts >= maxAttempts) {
    toggleFormInput(true);
    showToast(`Too many attempts! Please wait ${cooldownTime / 1000} seconds.`, 'error');

    setTimeout(() => {
      toggleFormInput(false);
      submitAttempts = 0;
      showToast('You can try again now.', 'success');
    }, cooldownTime);

    return;
  }

  // Increment counter for this attempt
  submitAttempts++;

  // Clear previous error messages
  resetErrors();

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  const passwordConfirmValue = passwordConfirmInput.value.trim();
  const nameValue = nameInput.value.trim();
  const phoneValue = phoneInput.value;
  const maleValue = maleInput.checked;
  const femaleValue = femaleInput.checked;

  // Gather Data for Validation
  const formData = {
    email: emailValue,
    password: passwordValue,
    passwordConfirm: passwordConfirmValue,
    name: nameValue,
    phone: phoneValue,
    maleChecked: maleValue,
    femaleChecked: femaleValue,
  };

  // Run Client-Side Validation
  const { isValid, errors, gender } = validateForm(formData);

  if (!isValid) {
    // ✅ FIX: return early so the API call never runs on invalid form
    showClientErrors(errors);
    return;
  }

  // Only disable the form AFTER validation passes
  toggleFormInput(true);

  // Prepare Data for API (Backend)
  const apiPayload = {
    username: formData.name,
    email: formData.email,
    password: formData.password,
    confirm_password: formData.passwordConfirm,
    phone: formData.phone,
    gender: gender, // True for Male, False for Female
  };

  // Call the Server
  try {
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const serverData = await response.json();

    // Handle Server Response
    if (!response.ok) {
      // ✅ FIX: always re-enable form on server error
      toggleFormInput(false);
      handleServerErrors(serverData);
      showToast(`Error ${response.status}: ${serverData.message}`, 'error');
    } else {
      showToast(`Success: ${serverData.message}`, 'success');

      // Save access and refresh tokens from server when successful registration
      const responseData = serverData.data || serverData.content;

      if (responseData) {
        const accessToken = responseData.access_token || responseData.accessToken;
        const refreshToken = responseData.refresh_token || responseData.refreshToken;

        if (accessToken) {
          sessionStorage.setItem('accessToken', accessToken);
        }

        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
      }

      // Redirect user to Home Page after 2 seconds
      setTimeout(() => {
        if (loadingOverlay) {
          loadingOverlay.classList.remove('d-none');
        }

        // Slight delay to let the loading screen render before the page unloads
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      }, 2000);
    }
  } catch (error) {
    // ✅ FIX: always re-enable form and hide loading on any network error
    if (loadingOverlay) {
      loadingOverlay.classList.add('d-none');
    }
    toggleFormInput(false);
    showToast('Network error occurred. Please try again later.', 'error');
  }
});

// If the page is loaded from the cache (Back button)
// Fixes the issue where inputs still show old data after pressing the back button
window.addEventListener('pageshow', () => {
  registerForm.reset();
  toggleFormInput(false);
  resetErrors();
  submitAttempts = 0;
  if (loadingOverlay) {
    loadingOverlay.classList.add('d-none');
  }
});