import { validateForm, showToast, setupPasswordToggle } from '../js/validation.js';

// Setup password visibility toggles
setupPasswordToggle('password');
setupPasswordToggle('passwordConfirm');

const form = document.getElementById('login');
const email = document.getElementById('emailLogin');
const password = document.getElementById('password');
const loginBtn = form.querySelector('button[type="submit"]');

// Add event to sumbit button
// Add async function to handle API call
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  setSuccess(email);
  setSuccess(password);
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  loginBtn.disabled = true;
  // Connect to the Server (API)

  try {
    const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue, password: passwordValue }),
    });

    // Await till get the data from response is done ( await is like waiting in line until u get the data done then continue to next step)
    // respone is raw data get from the server API and then,json to convert them into readable data
    // Data here is the holder for the converted readable data after decoded from .json()
    const data = await response.json();

    if (data.ok || data.statusCode === 200) {
      // this will shows: result -> data -> access_token
      const userData = data.data;

      if (userData) {
        if (userData.access_token) {
          // Save the undecoded access token and refresh token to session storage
          sessionStorage.setItem('accessToken', userData.access_token);
          sessionStorage.setItem('refreshToken', userData.refresh_token);
          // Redirect to home page after successful login
          window.location.href = '../pages/home.html';
        }
      }

    } else {
      // Handle login errors ( Backend already validation these all so no need to make 1, use the server validation messages)
      const serverMessage = data.message;
      // Checkuing email or password error from server message
      if (serverMessage.toLowerCase().includes('email')) {
        setError(email, serverMessage);
      } else if (serverMessage.includes('password')) {
        setError(password, serverMessage);
        // Push out the error
      } else {
        setError(password, serverMessage);
      }
    }
  } catch (error) {
    setError(email, 'Server connection failed.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerText = originalBtnText;
  }
});

// Set error functions
const setError = (element, message) => {
  let parent = element.parentElement;

  if (parent.classList.contains('input-group')) {
    parent = parent.parentElement;
  }

  const errorDisplay = parent.querySelector('.error');

  errorDisplay.innerText = message;
  element.classList.add('error');
  element.classList.remove('success');
};

// Set success functions
const setSuccess = (element) => {
  let parent = element.parentElement;

  if (parent.classList.contains('input-group')) {
    parent = parent.parentElement;
  }

  const errorDisplay = parent.querySelector('.error');

  errorDisplay.innerText = '';
  element.classList.add('success');
  element.classList.remove('error');
};
