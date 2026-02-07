import ApiService from './api.js';

// Wait for Dom to fully load
document.addEventListener('DOMContentLoaded', () => {
  // Create components
  initComponents();

  // Example: Using API
  // loadData();
});

/**
 * Khởi tạo các components
 */
function initComponents() {
  // Initialize components here
}

/**
 * Example: Load data from API
 */
async function loadData() {
  const data = await ApiService.get('/users');
  // Process data here
  return data;
}

// Export functions if needed
export { initComponents, loadData };
