// --- Regex logics ---
const REGEX_EMAIL = /^(?=.*[A-Z])[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+@gmail\.com$/;
const REGEX_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;
const REGEX_PHONE = /^[0-9]+$/;
const REGEX_NAME =
  /^[a-zA-Z0-9._ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;

// Show password toggle function
function setupPasswordToggle(inputFieldId) {
  const inputField = document.getElementById(inputFieldId);

  // Guard clause: ensure element exists to prevent errors
  if (!inputField)
  {
    return;
  }


  const toggleIcon = inputField.parentElement.querySelector('i');
  if (!toggleIcon)
  {
    return;
  }


  toggleIcon.addEventListener('click', function () {
    // 1. Toggle the type attribute
    const isPassword = inputField.getAttribute('type') === 'password';
    inputField.setAttribute('type', isPassword ? 'text' : 'password');

    // 2. Toggle the eye icon classes (FontAwesome dependency)
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
  });
}

// Toast notification function
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');

  // Create the individual toast box
  const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    // The icon get from emoji menu from windows ( Win + '.')
    // How to use:
    // 1. Use win + . to open emoji menu ( must have the cursor on the place you want to put in)
    // 2. Search for the emoji you want and click to insert
  toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✅' : '❎'}</div>
        <div class="toast-message">${message}</div>
    `;

  // Append to the hardcoded container
  container.appendChild(toast);

  // Animation: Fade In & Appear
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Animation: Fade Out & Remove
  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Validates the form data.
 * @param is act as an input holder
 * @param {Object} data - Object containing email, password, passwordConfirm, name, phone, maleChecked or femaleChecked
 * @returns {Object} - { isValid: boolean ( true/false ), errors: Object ( error/success or {} ) }
 */
function validateForm(data) {
  const errors = {};
  let isValid = true;
  let gender = null;

  // 1. Check Email
  if (!REGEX_EMAIL.test(data.email)) {
    errors.email = 'Email must have 1 capital letter and end with @gmail.com';
    isValid = false;
  }

  // 2. Check Password
  if (!REGEX_PASSWORD.test(data.password)) {
    errors.password = 'Password: 8-20 chars, 1 Capital & 1 Special char & 1 Number & 1 normal required ';
    isValid = false;
  }

  // 3. Check Password Confirmation
  if (data.password !== data.passwordConfirm) {
    errors.passwordConfirm = 'Password confirmation does not match';
    isValid = false;
  } else if (data.passwordConfirm === '') {
    errors.passwordConfirm = 'Please confirm your password';
    isValid = false;
  }

  // 4. Check Name
  if (!REGEX_NAME.test(data.name)) {
    errors.name = 'Name must be letters only (Vietnamese allowed), no numbers';
    isValid = false;
  }

  // 5. Check Phone number
  if (!REGEX_PHONE.test(data.phone)) {
    errors.phone = 'Phone must be numbers only';
    isValid = false;
  }

  // 6. Check Gender
  if (!data.maleChecked && !data.femaleChecked) {
    errors.gender = 'Please select a gender';
    isValid = false;
  } else if (data.maleChecked) {
    gender = true;
  } else if (data.femaleChecked) {
    gender = false;
  }

  return { isValid, errors, gender };
}

// Export the validateForm function
export { validateForm, showToast, setupPasswordToggle };
