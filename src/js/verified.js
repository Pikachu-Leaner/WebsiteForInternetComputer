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

  if (!verifyBtn) {return;}

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
      // Disable button after clicking when send to the backend API
      verifyBtn.disabled = true;
      // showing loading stage
      verifyBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Verifying...
      `;

      // Send the OTP to the backend ( API server ) for verification
      try {
        const response = await fetch('url', {
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
          setTimeout(() => {
            window.location.href = '../pages/changeNewPassword.html';
          }, 1500);
        }
        // Handle errors from backend using the message from the backend response
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

// Logic for the "Resend to your email ?" link
function setupResendLink() {
  const resendLink = document.querySelector('.resend-link');

  if (!resendLink) {return;}

  resendLink.addEventListener('click', async (e) => {
    e.preventDefault();

    // Changed: use the email stored in sessionStorage from the previous forgotPassword.js instead of getting accessToken in session storage
    // Since you not even log in to have the accessToken in it to begin with
    const userEmail = sessionStorage.getItem('userEmail');

    if (!userEmail) {
      showToast('Session error: Email not found. Please go back and try again.', 'error');
      return;
    }

    // Disable the link and show spinner
    const originalText = resendLink.textContent;
    resendLink.style.pointerEvents = 'none';
    resendLink.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

    try {
      const resendResponse = await fetch(
        'https://shoes-mall.onrender.com/api/v1/users/resend-verify-otp',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        },
      );

      const resendResult = await resendResponse.json();

      // Sucess !
      if (resendResponse.ok) {
        showToast('A new OTP has been sent to your email!', 'success');

        // Cooldown timer
        let countdown = 60;
        const timerInterval = setInterval(() => {
          resendLink.textContent = `Wait ${countdown}s to resend`;
          countdown--;
          if (countdown < 0) {
            clearInterval(timerInterval);
            resendLink.textContent = originalText;
            resendLink.style.pointerEvents = 'auto';
          }
        }, 1000);
      }
      // Errors
      else {
        throw new Error(resendResult.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      showToast(error.message || 'Something went wrong.', 'error');

      resendLink.textContent = originalText;
      resendLink.style.pointerEvents = 'auto';
    }
  });
}

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
  setupOTPAutoTab();
  setupVerifyButton();
  setupResendLink();
});
