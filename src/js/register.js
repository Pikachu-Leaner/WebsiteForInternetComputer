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

//function to reset error messages after failed attempt
function resetErrors() {
  const errorDivs = document.querySelectorAll('.validation-register');
  errorDivs.forEach((div) => {
    div.innerText = '';
    div.style.display = 'none';
  });
}

function handleServerErrors(data) {
  // 1. Get the message string
  const message = data.message || 'An error occurred';
  const lowerMsg = message.toLowerCase();

  // 2. Map message to specific fields based on keywords
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

  // summit attempt limit check
  if (submitAttempts >= maxAttempts) {
    toggleFormInput(true); // Disable form
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

  // 5. Run Client-Side Validation
  const { isValid, errors, gender } = validateForm(formData);

  if (!isValid) {
    // If validation fails, show errors and stop
    showClientErrors(errors);
  }

  toggleFormInput(true);

  // 6. Prepare Data for API (Backend)
  const apiPayload = {
    username: formData.name, // Currently using username as vietnamese not allow ( status 422 ) but without vietnamese will success ( status 201)
    email: formData.email,
    password: formData.password,
    confirm_password: formData.passwordConfirm,
    phone: formData.phone,
    gender: gender, // True for Male and False for Female
  };
  // For debugging purposes
  // console.log('API Payload being sent:', apiPayload);
  // 7. Call the Server
  try {
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const serverData = await response.json();

    // 8. Handle Server Response
    if (!response.ok) {
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

      //Redirect user to Home Page after 2 seconds
      setTimeout(() => {
        // Show the loading screen now
        if (loadingOverlay) {
          loadingOverlay.classList.remove('d-none');
        }

        // Slight delay to let the loading screen render before the page unloads
        setTimeout(() => {
          window.location.href = '../pages/index.html';
        }, 2000);
      }, 2000);
    }
  } catch (error) {
    if (loadingOverlay) {
      loadingOverlay.classList.add('d-none');
    }
    toggleFormInput(false);
    showToast('Network error occurred. Please try again later.', 'error');
  }
});

// If the page is loaded from the cache (Back button) [Make to fix the issue when use the <- in the website, it still show some of the data in input fields]
window.addEventListener('pageshow', () => {
  // Wipe the form clean
  registerForm.reset();
  toggleFormInput(false);
  resetErrors();
  submitAttempts = 0;
  // Hide loading overlay if visible
  if (loadingOverlay) {
    loadingOverlay.classList.add('d-none');
  }
});
