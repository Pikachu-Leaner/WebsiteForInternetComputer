import { validateProfile, showToast } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Select UI Elements ( buttons, form, inputs)
  const toggleBtn = document.getElementById('btnToggleProfile');
  const uploadBtn = document.getElementById('btnUploadImage');
  const profileForm = document.querySelector('.updateProfileForm');

  const avatarInput = document.getElementById('avatarInput');
  const profileImage = document.getElementById('profileImage');
  const uploadIcon = document.querySelector('.edit-avatar-icon');

  // State input here for easy access
  const inputs = profileForm.querySelectorAll('input');

  // state values for edit mode to track
  let isEditMode = false;
  let originalFormData = null;

  const getFormDataSnapshot = () => {
    const data = {};
    inputs.forEach((input) => {
      if (input.type === 'radio') {
        if (input.checked) data[input.name] = input.value;
      } else {
        data[input.id] = input.value;
      }
    });
    return JSON.stringify(data);
  };

  window.addEventListener('beforeunload', (e) => {
    if (isEditMode && originalFormData !== getFormDataSnapshot()) {
      e.preventDefault();
    }
  });

  /**
   * Function to switch between Read-only and Edit modes
   * @param {boolean} status - true to enable Read-only, false to enable Editing
   */
  const setViewMode = (status) => {
    isEditMode = !status;

    inputs.forEach((input) => {
      // Read-only for text inputs
      input.readOnly = status;

      // Disable radio buttons since they don't have readOnly property - they are not text inputs duh
      if (input.type === 'radio' || input.tagName === 'SELECT') {
        input.disabled = status;
      }
    });

    // Toggle character counters visibility ( .char-counter elements )
    const counters = document.querySelectorAll('.char-counter');
    counters.forEach((counter) => {
      counter.classList.toggle('d-none', status);
    });

    if (status) {
      // View mode ( when first load the page or after saving changes)
      toggleBtn.innerText = 'Update profile';
      toggleBtn.classList.replace('btn-success', 'btn-primary');
      if (uploadBtn) uploadBtn.classList.add('d-none');
      if (uploadIcon) uploadIcon.classList.add('d-none');
    } else {
      // Edit mode ( after clicking the update profile button)
      toggleBtn.innerText = 'Save changes';
      toggleBtn.classList.replace('btn-primary', 'btn-success', 'avatar-icon');
      if (uploadBtn) uploadBtn.classList.remove('d-none');
      if (uploadIcon) uploadIcon.classList.remove('d-none');
    }
  };

  setViewMode(true);

  const triggerFileSelect = () => {
    if (avatarInput) {
      avatarInput.click();
    } else {
      showToast('Avatar input element not found!');
    }
  };

  //  Pen icon
  if (uploadIcon) {
    uploadIcon.addEventListener('click', triggerFileSelect);
  }

  // Handle File Selection & Preview
  if (avatarInput) {
    avatarInput.addEventListener('change', (event) => {
      const file = event.target.files[0];

      if (file) {
        // Validation: Check file size (5MB)
        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
          showToast('File is too large! Please select an image under 5MB.', 'error');
          avatarInput.value = ''; // Reset input
          return;
        }

        // Preview Logic
        const reader = new FileReader();
        reader.onload = function (e) {
          if (profileImage) {
            profileImage.src = e.target.result;
            showToast('Image selected. Click "Save changes" to finalize.', 'info');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const setupCharCounter = (inputId, maxLength) => {
    const inputElem = document.getElementById(inputId);
    if (!inputElem) return;

    // Create counter UI element
    const counterDiv = document.createElement('div');
    counterDiv.className = 'char-counter text-end small text-muted mt-1 d-none';
    counterDiv.innerHTML = `<span id="${inputId}-count">0</span>/${maxLength}`;
    inputElem.parentNode.appendChild(counterDiv);

    const counterSpan = document.getElementById(`${inputId}-count`);

    // Real-time input listener
    inputElem.addEventListener('input', () => {
      const currentLength = inputElem.value.length;
      counterSpan.innerText = currentLength;

      // Visual threshold warning at 80%
      if (currentLength >= maxLength * 0.8) {
        counterSpan.classList.add('text-danger');
      } else {
        counterSpan.classList.remove('text-danger');
      }
    });
  };

  // Set up number of charater allow counters for specific fields
  setupCharCounter('inputUsername', 20);
  setupCharCounter('inputLocation', 100);
  setupCharCounter('inputFirstName', 10);
  setupCharCounter('inputLastName', 10);
  setupCharCounter('inputPhone', 11);
  setupCharCounter('inputBirthday', 10);

  // Edit update profile/save changes button
  toggleBtn.addEventListener('click', () => {
    if (!isEditMode) {
      // Entering Edit Mode
      setViewMode(false);
      showToast('You can now edit your profile', 'success');
    } else {
      //Attempting to Save Changes
      handleProfileUpdate();
    }
  });

  function handleProfileUpdate() {
    // Collect data from the UI
    const profileData = {
      username: document.getElementById('inputUsername').value,
      firstName: document.getElementById('inputFirstName').value,
      lastName: document.getElementById('inputLastName').value,
      gender: document.querySelector('input[name="gender"]:checked')?.id || null,
      location: document.getElementById('inputLocation').value,
      email: document.getElementById('inputEmailAddress').value,
      phone: document.getElementById('inputPhone').value,
      birthday: document.getElementById('inputBirthday').value,
    };

    const validation = validateProfile(profileData);

    if (!validation.isValid) {
      // Show  errors that have been founded
      const firstErrorKey = Object.keys(validation.errors)[0];
      const errorMessage = validation.errors[firstErrorKey];

      showToast(errorMessage, 'error');

      const errorInput = document.querySelector(`[id*="${firstErrorKey}"]`);
      if (errorInput) errorInput.focus();
    } else {
      showToast('Profile updated successfully!', 'success');

      // Switch back to Read-only mode
      setViewMode(true);
    }
  }
});
