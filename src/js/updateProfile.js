// Self-noted: There is currently no birtday data in the API to test so ask the backend to add this feature in later.
// Accidentally make the birtday input fiel + validation so. For now, it will stay there after backend add it in
// Ask to add the data name to sbe 'birthday'.

import { validateProfile, showToast, confirmUpdateAction } from '../js/validation.js';

// To kick back to login back when unable to get access token ( Not login  )
// Manual deletes the token in the session storage
// Have to refresh the page to active this
if (!sessionStorage.getItem('accessToken')) {
  alert('Your session has been expired or not log in! Pls login again to use this feature.');
  window.location.href = '../pages/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // To kick back to login back when unable to get access token ( Not login  )
  // Manual deletes the token in the session storage
  // Have to refresh the page to active this
  if (!sessionStorage.getItem('accessToken')) {
    alert('Your session has been expired or not log in! Pls login again to use this feature.');
    window.location.href = '../pages/login.html';
  }
  // Select UI Elements ( buttons, form, inputs)
  const toggleBtn = document.getElementById('btnToggleProfile');
  const uploadBtn = document.getElementById('btnUploadImage');
  const profileForm = document.querySelector('.updateProfileForm');

  const avatarInput = document.getElementById('avatarInput');
  const profileImage = document.getElementById('profileImage');
  const uploadIcon = document.querySelector('.edit-avatar-icon');
  let currentAvatarUrl = '';

  // Input field elements
  const inputUsername = document.getElementById('inputUsername');
  const inputFirstName = document.getElementById('inputFirstName');
  const inputLastName = document.getElementById('inputLastName');
  const inputLocation = document.getElementById('inputLocation');
  const inputEmail = document.getElementById('inputEmailAddress');
  const inputPhone = document.getElementById('inputPhone');
  const inputBirthday = document.getElementById('inputBirthday');

  // State input here for easy access
  const inputs = profileForm.querySelectorAll('input');

  // state values for edit mode to track
  let isEditMode = false;
  let originalFormData = null;
  let finalCompressedFile = null;

  // force to set character counters to input fields at start
  const updateAllCounters = () => {
    inputs.forEach((input) => {
      input.dispatchEvent(new Event('input'));
    });
  };

  // Get the old profile data from the backend API and populate the form
  const getProfile = async () => {
    const accessToken = sessionStorage.getItem('accessToken');
    const loadingOverlay = document.getElementById('loading-overlay');

    try {
      if (loadingOverlay) loadingOverlay.classList.remove('d-none');

      const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/@me/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      //For debugging purposes
      console.log('API Response Object:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch profile data');
      }

      const userData = result.data || result;

      currentAvatarUrl = userData?.avatar || '';

      // Check and map the data to the input fields
      if (inputUsername) inputUsername.value = userData?.username || '';
      if (inputFirstName) inputFirstName.value = userData?.first_name || '';
      if (inputLastName) inputLastName.value = userData?.last_name || '';
      if (inputEmail) inputEmail.value = userData?.email || '';
      if (inputPhone) inputPhone.value = userData?.phone || '';
      if (inputBirthday) inputBirthday.value = userData?.birthday || '';

      // Move the address from API to inputLocation
      if (inputLocation) inputLocation.value = userData.address || '';

      // Check and map the data to the radio buttons
      if (userData.gender === true) {
        const maleRadio = document.getElementById('male');
        if (maleRadio) maleRadio.checked = true;
      } else if (userData.gender === false) {
        const femaleRadio = document.getElementById('female');
        if (femaleRadio) femaleRadio.checked = true;
      }

      // Check and map the data to the profile image area
      if (userData.avatar && profileImage) {
        profileImage.src = userData.avatar;

        // Force the img data get from api to fit the currnent profile image circle
        profileImage.style.width = '225px';
        profileImage.style.height = '225px';
        profileImage.style.borderRadius = '50%';
        profileImage.style.objectFit = 'cover';
      }

      originalFormData = getFormDataSnapshot();
      updateAllCounters();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      // Hide loading overlay
      if (loadingOverlay) loadingOverlay.classList.add('d-none');
    }
  };
  // Use the function to get and populate the form when first load the page
  getProfile();

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

  /**
   * Compresses and resizes an image file.
   * @param {File} file - The original image file.
   * @param {number} maxWidth - Maximum width for the image.
   * @param {number} quality - JPEG quality (0.0 to 1.0).
   * @returns {Promise<{blob: Blob, dataUrl: string}>}
   */
  const optimizeImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio ( to fit the profile image )
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          // Create canvas for compression
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed Data URL (for preview)
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Get compressed Blob (for upload)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                reject(new Error('Image compression failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

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
    avatarInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Img validation
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        showToast('Only JPG and PNG files are allowed.', 'error');
        avatarInput.value = '';
        return;
      }

      if (file.size > maxSize) {
        showToast('File is too large! Please select an image under 5MB.', 'error');
        avatarInput.value = '';
        return;
      }

      try {
        showToast('Optimizing image...', 'info');

        // Compress and resize the image file
        const { blob, dataUrl } = await optimizeImage(file, 800, 0.7);

        // Force the image that recently change to fit 225x225 to fit the profile image cicrle
        if (profileImage) {
          profileImage.src = dataUrl;
          profileImage.style.width = '225px';
          profileImage.style.height = '225px';
          profileImage.style.borderRadius = '50%';
          profileImage.style.objectFit = 'cover';
        }

        // Store for upload
        finalCompressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        showToast('Image ready. Click "Upload new image" to finalize.', 'success');
      } catch (error) {
        showToast('Error processing image.', 'error');
      }
    });
  }

  // Upload image function button
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const accessToken = sessionStorage.getItem('accessToken');

      // This also like the same logic at the start but not when refrsh but for when click the button then it kick user back  to login page
      if (!accessToken) {
        alert('Your session has been expired or not log in! Pls login again to use this feature.');
        window.location.href = '../pages/login.html';
        return;
      }

      // Validation
      if (!finalCompressedFile) {
        showToast('Please select an image first.', 'error');
        return;
      } else {
        showToast('Uploading image...', 'success');
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('image', finalCompressedFile);

      // Show Loading Overlay
      //if (loadingOverlay) loadingOverlay.classList.remove('d-none');

      try {
        uploadBtn.disabled = true;
        //Send POST request to the backend API
        const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/@me/avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        // Parse JSON result immediately to get the server message
        const result = await response.json();
        //For debugging purposes
        console.log('API Response Object:', result);

        // Error Handling
        if (!response.ok) {
          const serverErrorMessage = result.message || result.error || response.statusText;
          throw new Error(serverErrorMessage);
        }

        // Success Handling
        showToast(result.message || 'Avatar uploaded successfully!', 'success');

        // Cleanup
        finalCompressedFile = null;
        if (avatarInput) avatarInput.value = '';

        // make the promise to wait until the getProfile function is done before switch back to edit-mode
        await getProfile();
        originalFormData = getFormDataSnapshot();
        setViewMode(false);

        // Small delay before reload so user can read the success toast
        setTimeout(() => {
          // remove window.location.reload() since it got conflict with the setViewmode(false) [ since reload = set theViewmode back to it orignal state which is true ! ]
        }, 1500);
      } catch (error) {
        showToast(error.message || 'Failed to upload image. Please try again.', 'error');
      } finally {
        // Hide Loading Overlay
        uploadBtn.disabled = false;
        loadingOverlay.classList.add('d-none');
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

  // Send the updated profile data to the backend API
  const handleProfileUpdate = async () => {
    // Collect data from the UI
    const genderInput = document.querySelector('input[name="gender"]:checked');
    let genderBoolean = null;

    if (genderInput) {
      genderBoolean = genderInput.id === 'male' ? true : false;
    }

    // Prepare the data to send to the backend
    const validationData = {
      // username: document.getElementById('inputUsername').value,
      firstName: document.getElementById('inputFirstName').value,
      lastName: document.getElementById('inputLastName').value,
      gender: genderBoolean,
      location: document.getElementById('inputLocation').value,
      email: document.getElementById('inputEmailAddress').value.trim(),
      phone: document.getElementById('inputPhone').value.trim(),
      // birthday: document.getElementById('inputBirthday').value,
      avatar: currentAvatarUrl,
      cover_photo: currentAvatarUrl,
    };

    // Prepare the object for the API (Backend typically uses 'address' instead of 'location')
    const apiPayload = {
      // username: inputUsername,
      first_name: validationData.firstName,
      last_name: validationData.lastName,
      email: validationData.email,
      phone: validationData.phone,
      // birthday: inputBirthday,
      gender: genderBoolean,
      address: validationData.location,
      avatar: currentAvatarUrl,
      cover_photo: currentAvatarUrl,
    };

    // validation before send to backend
    const validation = validateProfile(validationData);

    if (!validation.isValid) {
      const firstErrorKey = Object.keys(validation.errors)[0];
      showToast(validation.errors[firstErrorKey], 'error');

      // Focus error inputs based on the first error key ( since the key is the same as the input id, we can use it to find the input to focus )
      const errorFieldId =
        firstErrorKey === 'address'
          ? 'inputLocation'
          : `input${firstErrorKey.charAt(0).toUpperCase() + firstErrorKey.slice(1)}`;
      const errorInput = document.getElementById(errorFieldId);
      if (errorInput) errorInput.focus();

      return;
    }
    // Send to Backend
    confirmUpdateAction(
      // Clicked Confirm
      async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const loadingOverlay = document.getElementById('loading-overlay');
        const originalBtnText = 'Save changes';

        try {
          if (loadingOverlay) loadingOverlay.classList.remove('d-none');
          toggleBtn.disabled = true;
          toggleBtn.innerText = 'Saving...';
          inputs.forEach((input) => (input.disabled = true));

          const response = await fetch('https://shoes-mall.onrender.com/api/v1/users/@me/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(apiPayload),
          });

          const result = await response.json();
          // For debugging purposes
          console.log('API Response Object:', result);

          if (!response.ok) {
            toggleBtn.disabled = false;
            toggleBtn.innerText = 'Save Changes';
            inputs.forEach((input) => (input.disabled = false));
            throw new Error(result.message || 'Failed to update profile');
          } else {
            toggleBtn.disabled = false;
            toggleBtn.innerText = 'Save Changes';
            inputs.forEach((input) => (input.disabled = false));
            showToast('Profile updated successfully!', 'success');
          }
          // Update the "original" state of snapshot so the browser doesn't warn about unsaved changes
          originalFormData = getFormDataSnapshot();

          // Switch back to Read-only mode after successful update
          setViewMode(true);

          // Move back to profile page after successful update
          window.location.href = '../pages/profile.html';
        } catch (error) {
          showToast(error.message, 'error');
        } finally {
          if (loadingOverlay) loadingOverlay.classList.add('d-none');
          toggleBtn.disabled = false;
          if (isEditMode) {
            toggleBtn.innerText = originalBtnText;
          }
        }
      },

      () => {
        getProfile();
        setViewMode(false);
        showToast('Changes discarded ! You can try to update again if you want.', 'info');
      }
    );
  };
});
