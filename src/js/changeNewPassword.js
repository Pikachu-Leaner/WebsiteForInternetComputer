import { changeNewPassword, showToast, setupPasswordToggle } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup password toggle for both new password and confirm password fields
  setupPasswordToggle('new-forgot-password');
  setupPasswordToggle('new-confirm-forgot-password');

  const form = document.querySelector('form');
  const newPasswordInput = document.getElementById('new-forgot-password');
  const confirmPasswordInput = document.getElementById('new-confirm-forgot-password');

  const newPassError = document.getElementById('newPassError');
  const confirmPassError = document.getElementById('confirmPassError');

  const strengthContainer = document.getElementById('strength-progress-container');
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');

  // Real-time Password Strength Logic
  newPasswordInput.addEventListener('input', function () {
    const val = newPasswordInput.value;
    let strengthScore = 0;

    // Reveal or hide progress bar
    if (val.length > 0) {
      strengthContainer.classList.remove('d-none');
    } else {
      strengthContainer.classList.add('d-none');
      strengthText.innerText = '';
      strengthText.className = '';
      checkMatch();
      return;
    }

    // Calculate score based on strength criteria
    if (val.length >= 8) strengthScore += 1;
    if (/[A-Z]/.test(val)) strengthScore += 1;
    if (/[a-z]/.test(val)) strengthScore += 1;
    if (/[0-9]/.test(val)) strengthScore += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) strengthScore += 1;

    let percent = 0;
    let text = '';
    let colorClass = '';
    let textColor = '';

    switch (strengthScore) {
      case 1:
      case 2:
        percent = 25;
        text = 'Weak';
        colorClass = 'bg-danger';
        textColor = 'text-danger';
        break;
      case 3:
        percent = 50;
        text = 'Fair';
        colorClass = 'bg-warning';
        textColor = 'text-warning';
        break;
      case 4:
        percent = 75;
        text = 'Good';
        colorClass = 'bg-primary';
        textColor = 'text-primary';
        break;
      case 5:
        percent = 100;
        text = 'Strong';
        colorClass = 'bg-success';
        textColor = 'text-success';
        break;
    }

    // Apply visual updates
    strengthBar.style.width = percent + '%';
    strengthBar.className = `progress-bar ${colorClass}`;
    strengthText.innerText = `Strength: ${text}`;
    strengthText.className = `small mt-1 fw-bold ${textColor}`;

    checkMatch();
  });

  // Real-time Match Logic for Confirm Password
  confirmPasswordInput.addEventListener('input', checkMatch);

  function checkMatch() {
    const val1 = newPasswordInput.value;
    const val2 = confirmPasswordInput.value;

    if (val2.length === 0) {
      confirmPassError.innerText = '';
      return;
    }

    if (val1 === val2) {
      confirmPassError.innerText = '✅ Passwords match!';
      confirmPassError.className = 'error text-success small mt-1';
    } else {
      confirmPassError.innerText = '❌ Passwords do not match';
      confirmPassError.className = 'error text-danger small mt-1';
    }
  }

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
