import { validateEmailInput, showToast } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form');
  const emailInput = document.getElementById('email');

  if (!loginForm || !emailInput) {
    return;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailValue = emailInput.value;

    const result = validateEmailInput(emailValue);

    if (result.isValid) {
      showToast('Reset link sent! Please check your Gmail.', 'success');

      emailInput.value = '';
    } else {
      showToast(result.message, 'error');

      emailInput.classList.add('is-invalid');
      setTimeout(() => emailInput.classList.remove('is-invalid'), 3000);
    }
  });
});
