document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('btnToggleProfile');
  const uploadBtn = document.getElementById('btnUploadImage');
  const form = document.querySelector('.updateProfileForm');
  const inputs = form.querySelectorAll('input');

  // State variable to track if we are in "Edit Mode"
  let isEditMode = false;

  // 1. Initial Setup: Read-only mode
  const setReadOnly = (status) => {
    isEditMode = !status;

    inputs.forEach((input) => {
      input.readOnly = status;
      // For radio buttons, we use disabled because readOnly doesn't apply
      if (input.type === 'radio') {
        input.disabled = status;
      }
    });

    if (status) {
      // VIEW MODE
      toggleBtn.innerText = 'Update profile';
      uploadBtn.classList.add('d-none'); // Hide upload button
    } else {
      // EDIT MODE
      toggleBtn.innerText = 'Save changes';
      uploadBtn.classList.remove('d-none'); // Show upload button
    }
  };

  // Run on page load
  setReadOnly(true);

  // 2. Toggle Functionality
  toggleBtn.addEventListener('click', () => {
    if (!isEditMode) {
      // Switch to Edit Mode
      setReadOnly(false);
    } else {
      // Switch back to View Mode (after saving)
      console.log('Saving changes...');
      // Here you would typically call your API to save data
      setReadOnly(true);
    }
  });
});
