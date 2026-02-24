import { validateEmailInput, showToast } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const resetBtn = document.getElementById('btn-email-reset');

  if (!loginForm || !emailInput || !resetBtn) {
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailValue = emailInput.value;

    // Client-side Validation
    const validation = validateEmailInput(emailValue);

    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }

    // Prepare UI for Loading
    const originalText = resetBtn.innerText;
    resetBtn.disabled = true;
    resetBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

    try {
      // Call Back-end API
      const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailValue,
        }),
      });

      const data = await response.json();
      //For debugging purposes
      console.log('API Response Object:', data);

      if (response.ok) {
        showToast(data.message || 'Success! Check your email.', 'success');
        emailInput.value = '';
      } else {
        showToast(data.message || 'Something went wrong.', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to the server. Please try again later.', 'error');
    } finally {
      resetBtn.disabled = false;
      resetBtn.innerText = originalText;
    }
  });
});
