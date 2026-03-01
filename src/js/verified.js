//OTP Auto-Focus & Auto-Tab Logic
function setupOTPAutoTab() {
  const inputs = document.querySelectorAll('.otp-box');

  inputs.forEach((input, index) => {
    // Handle typing a number
    input.addEventListener('input', (e) => {
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

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
  fetchProfileEmail();
  setupOTPAutoTab();
});
