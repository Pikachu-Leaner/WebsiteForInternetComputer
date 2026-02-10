import { validateProfile, showToast } from '../js/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Select UI Elements ( buttons, form, inputs)
  const toggleBtn = document.getElementById('btnToggleProfile');
  const uploadBtn = document.getElementById('btnUploadImage');
  const profileForm = document.querySelector('.updateProfileForm');

  // State input here for easy access
  const inputs = profileForm.querySelectorAll('input');

  // state a value for edit mode to track
  let isEditMode = false;

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

    if (status) {
      // View mode ( when first load the page or after saving changes)
      toggleBtn.innerText = 'Update profile';
      toggleBtn.classList.replace('btn-success', 'btn-primary');
      uploadBtn.classList.add('d-none'); 
    } else {
      // Edit mode ( after clicking the update profile button)
      toggleBtn.innerText = 'Save changes';
      toggleBtn.classList.replace('btn-primary', 'btn-success');
      uploadBtn.classList.remove('d-none'); 
    }
  };

  setViewMode(true);

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
