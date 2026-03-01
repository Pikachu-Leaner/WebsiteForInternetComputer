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
  // Select the "Verify & Continue" button 
  const verifyBtn = document.querySelectorAll('.btn-custom-purple')[0];

  if (!verifyBtn) return;

  verifyBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.otp-input');
    let combinedOTP = '';

    // Loop through all 6 boxes and then finally combine them into 1 value
    inputs.forEach((input) => {
      combinedOTP += input.value;
    });

    // Run the client-side validation
    const result = validateOTP(combinedOTP);

    // success
    if (result.isValid) {
      showToast('OTP is in the correct format! Verifying...', 'success');
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
