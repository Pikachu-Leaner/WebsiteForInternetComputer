import { changeNewPassword, showToast, setupPasswordToggle } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle('new-forgot-password');
  setupPasswordToggle('new-confirm-forgot-password');

  const form = document.querySelector('form');
  const newPasswordInput = document.getElementById('new-forgot-password');
  const confirmPasswordInput = document.getElementById('new-confirm-forgot-password');

  // Grabbing the error divs from the HTML we built previously
  const newPassError = document.getElementById('newPassError');
  const confirmPassError = document.getElementById('confirmPassError');

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    // Clear any previous error messages
    newPassError.innerText = '';
    confirmPassError.innerText = '';

    // Prepare the data object for validation
    const formData = {
      newPassword: newPasswordInput.value,
      confirmPassword: confirmPasswordInput.value,
    };

    const validation = changeNewPassword(formData);
    // Success
    if (validation.isValid) {
      showToast('Password matches all requirements!', 'success');
    }
    // Errors
    else {
      if (validation.errors.newPassword) {
        newPassError.innerText = validation.errors.newPassword;
      }
      if (validation.errors.confirmPassword) {
        confirmPassError.innerText = validation.errors.confirmPassword;
      }
      showToast('Please fix the errors below.', 'error');
    }
  });
});
