// --- Regex logics ---
const REGEX_EMAIL = /^(?=.*[A-Z])[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+@gmail\.com$/;
const REGEX_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;
const REGEX_PHONE = /^[0-9]{9,11}$/;
const REGEX_NAME =
  /^[a-zA-Z0-9._ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]{5,10}$/;
const REGEX_USERNAME = /^[a-zA-Z0-9_]{3,20}$/;
//const REGEX_BIRTHDAY = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
const REGEX_OTP = /^[0-9]{6}$/;

// Show password toggle function
function setupPasswordToggle(inputFieldId) {
  const inputField = document.getElementById(inputFieldId);

  // Guard clause: ensure element exists to prevent errors
  if (!inputField) {
    return;
  }

  const toggleIcon = inputField.parentElement.querySelector('i');
  if (!toggleIcon) {
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
    errors.password =
      'Password: 8-20 chars, 1 Capital & 1 Special char & 1 Number & 1 normal required ';
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

/**
 * Validates the Profile Update form specifically
 * @param {Object} data - Contains username, firstName, lastName, gender, location, email, phone, birthday
 */
function validateProfile(data) {
  const errors = {};
  let isValid = true;

  // 1. Username
  if (!REGEX_USERNAME.test(data.username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscores)';
    isValid = false;
  }

  // 2. Names (First and Last)
  if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 letters';
    isValid = false;
  } else if (!REGEX_NAME.test(data.firstName)) {
    errors.firstName = 'First name should only contain letters';
    isValid = false;
  }

  if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 letters';
    isValid = false;
  } else if (!REGEX_NAME.test(data.lastName)) {
    errors.lastName = 'Last name should only contain letters';
    isValid = false;
  }

  // 3. Gender
  if (data.gender === null || data.gender === undefined) {
    errors.gender = 'Please select a gender';
    isValid = false;
  }

  // 4. Location
  if (!data.location || data.location.trim().length < 2) {
    errors.location = 'Please enter a valid location';
    isValid = false;
  }

  // 5. Email
  if (!REGEX_EMAIL.test(data.email)) {
    errors.email = 'Invalid Gmail format (requires 1 capital letter)';
    isValid = false;
  }

  // 6. Phone
  if (!REGEX_PHONE.test(data.phone)) {
    errors.phone = 'Phone number must be 9-11 digits';
    isValid = false;
  }

  // Disable for now since no data in the backend
  /* 7. Birthday
  if (!REGEX_BIRTHDAY.test(data.birthday)) {
    errors.birthday = 'Please use a valid date format (YYYY-MM-DD)';
    isValid = false;
  }
  */

  return { isValid, errors };
}

// Setup discard changes modal area
function confirmUpdateAction(onConfirm, onDiscard) {
  // Create Modal area HTML if it doesn't exist
  if (!document.getElementById('saveModal')) {
    const modalHTML = `
        <div class="modal fade" id="saveModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Update</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Do you want to save these changes to your profile?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="btnCancelSave" data-bs-dismiss="modal">Cancel & Discard</button>
                        <button type="button" class="btn btn-primary" id="btnConfirmSave">Confirm</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Get Elements
  const modalEl = document.getElementById('saveModal');
  const confirmBtn = document.getElementById('btnConfirmSave');
  const cancelBtn = document.getElementById('btnCancelSave');
  // @ts-ignore
  const modal = new bootstrap.Modal(modalEl); // eslint-disable-line no-undef

  // Clean all the previous event listeners by cloning and replacing nodes
  const newConfirm = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

  const newCancel = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

  // On Confirm
  newConfirm.addEventListener('click', () => {
    modal.hide();
    if (onConfirm) {
      onConfirm();
    } // Run the save function
  });

  // On Cancel/Discard
  newCancel.addEventListener('click', () => {
    modal.hide();
    if (onDiscard) {
      onDiscard();
    } // Run the revert function
  });

  // 5. Show the modal
  modal.show();
}

function validateEmailInput(email) {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' };
  }

  if (!REGEX_EMAIL.test(email)) {
    return {
      isValid: false,
      message: 'Email must have 1 capital letter and end with @gmail.com',
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Validates an OTP (One-Time Password) input.
 * Expects a numeric string of exactly 6 digits.
 * @param {string|number} otp - The OTP to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
function validateOTP(otp) {
  // Convert to string and trim to handle numbers or accidental spaces safely
  const otpString = String(otp || '').trim();

  if (!otpString) {
    return { isValid: false, message: 'OTP is required' };
  }

  // Uses the updated REGEX_OTP to check for exactly 6 digits
  if (!REGEX_OTP.test(otpString)) {
    return {
      isValid: false,
      message: 'OTP must be exactly 6 digits',
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Validates the new password reset form.
 * @param {Object} data - Contains newPassword and confirmPassword
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
function changeNewPassword(data) {
  const errors = {};
  let isValid = true;

  // Check New Password against your existing REGEX_PASSWORD
  if (!REGEX_PASSWORD.test(data.newPassword)) {
    errors.newPassword =
      'Password: 8-20 chars, 1 Capital & 1 Special char & 1 Number & 1 normal required';
    isValid = false;
  }

  // Check Password Confirmation
  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Password confirmation does not match';
    isValid = false;
  } else if (data.confirmPassword === '') {
    errors.confirmPassword = 'Please confirm your new password';
    isValid = false;
  }

  return { isValid, errors };
}

// Export the validateForm function
export {
  validateForm,
  showToast,
  setupPasswordToggle,
  validateProfile,
  confirmUpdateAction,
  validateEmailInput,
  validateOTP,
  changeNewPassword,
};
