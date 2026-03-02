import { validateOTP, showToast } from './validation.js';

// OTP Auto-Focus & Auto-Tab Logic
function setupOTPAutoTab() {
  const inputs = document.querySelectorAll('.otp-input');

  inputs.forEach((input, index) => {
    // Handle typing a number
    input.addEventListener('input', (e) => {
      // Force the input to be a number only, instantly removing all other characters
      e.target.value = e.target.value.replace(/[^0-9]/g, '');

      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Handle Backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

// Validation Logic for the Verify Button
function setupVerifyButton() {
  const verifyBtn = document.querySelectorAll('.btn-custom-purple')[0];

  if (!verifyBtn) return;

  verifyBtn.addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.otp-input');
    let combinedOTP = '';

    // Loop through all 6 boxes and combine them all into 1 value
    inputs.forEach((input) => {
      combinedOTP += input.value;
    });

    // Run the client-side validation
    const result = validateOTP(combinedOTP);

    if (result.isValid) {
      // Disable button and show a loading state 
      verifyBtn.disabled = true;
      // showing loading stage 
      verifyBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Verifying...
      `;

      // Send the OTP to the backend ( API server ) for verification
      try {
        const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/verify-otp', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            otp: combinedOTP, // Sending the 6-digit string to the backend
          }),
        });

        const data = await response.json();
        // successful verification
        if (response.ok) {
          showToast('OTP verified successfully!', 'success');
          // Redirect the user to the next page 
          /*
          setTimeout(() => {
            window.location.href = '../pages/login.html'; 
          }, 1500);
          */
        }
        // errors from backend
        else {
          showToast(data.message || 'Invalid OTP code. Please try again.', 'error');
          verifyBtn.disabled = false;
          verifyBtn.textContent = 'Verify & Continue';
        }
      } catch (error) {
        // Network error or server is down
        console.error('Verification error:', error);
        showToast('Something went wrong. Please check your connection.', 'error');
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify & Continue';
      }
    }
    // errors
    else {
      showToast(result.message, 'error');
    }
  });
}

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
  setupOTPAutoTab();
  setupVerifyButton();
});
