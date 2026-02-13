import { changePasswordValidation, showToast, setupPasswordToggle } from './validation.js';

// To kick back to login back when unable to get access token ( Not login  )
// Manual deletes the token in the session storage
// Have to refresh the page to active this
if (!sessionStorage.getItem('accessToken')) {
  alert('Your session has been expired or not log in! Pls login again to use this feature.'); // eslint-disable-line no-alert
  window.location.href = '../pages/login.html';
}

// Setup the functions ( password toggle for all 3 passwordd input fields)
setupPasswordToggle('oldPassword');
setupPasswordToggle('newPassword');
setupPasswordToggle('confirmNewPassword');

const passwordForm = document.querySelector('form');
const loadingOverlay = document.getElementById('loading-overlay');

// Function to show/hide loading overlay
function toggleLoading(isLoading) {
  if (!loadingOverlay) {
    return;
  }

  const formElements = passwordForm.querySelectorAll('input, button');

  if (isLoading) {
    loadingOverlay.classList.remove('d-none');
    formElements.forEach((el) => (el.disabled = true));
  } else {
    setTimeout(() => {
      loadingOverlay.classList.add('d-none');
      // Re-enable all inputs and buttons
      formElements.forEach((el) => (el.disabled = false));
    }, 200);
  }
}

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Collect the data from the inputs
  const oldPass = document.getElementById('oldPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmNewPassword').value;
  const accessToken = sessionStorage.getItem('accessToken');

  // This also like the same logic at the start but not when refrsh but for when click the button then it kick user back  to login page
  if (!accessToken) {
    alert('Your session has been expired or not log in! Pls login again to use this feature.'); // eslint-disable-line no-alert
    window.location.href = '../pages/login.html';
    return;
  }

  // Run the validation function
  const { isValid, errors } = changePasswordValidation(oldPass, newPass, confirmPass);

  // Clear previous error messages
  document.querySelectorAll('.error').forEach((div) => (div.innerText = ''));

  if (!isValid) {
    if (errors.oldPassword) {
      document.getElementById('oldPassError').innerText = errors.oldPassword;
    }
    if (errors.newPassword) {
      document.getElementById('newPassError').innerText = errors.newPassword;
    }
    if (errors.confirmNewPassword) {
      document.getElementById('confirmPassError').innerText = errors.confirmNewPassword;
    }
  }

  // Comfirmation warning befire changing the password
  const userConfirmed = confirm( // eslint-disable-line no-alert
    'Are you sure you want to change your password? Pls double check again if you are unsure !',
  );

  if (!userConfirmed) {
    return;
  }

  // Create sending data to Api
  const payload = {
    old_password: oldPass,
    password: newPass,
    confirm_password: confirmPass,
  };

  // For debugging purposes
  //console.log('API Payload being sent:', payload);

  try {
    // Load every time call api ( active the spinner loading screen)
    toggleLoading(true);

    // Send request to Api
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    //For debugging purposes
    //console.log('API Response Object:', result);

    // Success respone
    if (response.ok) {
      // Comfirmation for change password successful
      showToast('Password changed successfully!', 'success');
      passwordForm.reset();
      document.getElementById('strength-bar').className = 'progress-bar';
      document.getElementById('strength-text').innerText = 'Strength: None';
      // Clear the old tokens ( access/refresh ) in the session storage before kick back to login page
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      // Send user back to the login page
      window.location.href = '../pages/login.html';
    }
    // Expired token respone ( situation send to the Api server when access token expired )
    // However the case for no login ( have access token in the session storage already been deal with in the profle.js with when no access token not show the link to click change password.)
    else if (response.status === 401) {
      alert('Your session has expired. Please log in again.'); // eslint-disable-line no-alert

      // Clear the old tokens ( access/refresh ) in the session storage before kick back to login page
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      window.location.href = '../pages/login.html';
    }
    // Errors respone
    else {
      const serverMessage = result.message || 'An error occurred';

      if (response.status === 404) {
        document.getElementById('oldPassError').innerText = serverMessage;
      }
      // Send back the error get from api server
      showToast(serverMessage, 'error');
    }
  } catch (error) {
    // Send back the error get from api server
    showToast(error.message, 'error');
  } finally {
    // Disable the loading screen ( or it gonna stuck endlessly in the loading stage)
    toggleLoading(false);
  }
});

const newPassInput = document.getElementById('newPassword');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

newPassInput.addEventListener('input', () => {
  const val = newPassInput.value;
  let score = 0;

  // Logic criteria
  if (val.length >= 8) {
    score++;
  }
  if (/[A-Z]/.test(val)) {
    score++;
  }
  if (/[a-z]/.test(val)) {
    score++;
  }
  if (/\d/.test(val)) {
    score++;
  }
  if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
    score++;
  }

  // Reset classes
  strengthBar.className = 'progress-bar';
  strengthText.className = 'fw-bold';

  if (val.length === 0) {
    strengthText.innerText = 'Strength: None';
    strengthText.classList.add('text-none');
  } else if (score <= 2) {
    strengthBar.classList.add('is-weak');
    strengthText.innerText = 'Strength: Weak';
    strengthText.classList.add('text-weak');
  } else if (score <= 4) {
    strengthBar.classList.add('is-medium');
    strengthText.innerText = 'Strength: Medium';
    strengthText.classList.add('text-medium');
  } else {
    strengthBar.classList.add('is-strong');
    strengthText.innerText = 'Strength: Strong';
    strengthText.classList.add('text-strong');
  }
});
