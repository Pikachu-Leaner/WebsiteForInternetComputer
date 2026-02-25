import axios from 'axios';
import APP_CONFIG from '../../config/api.config.js';

// Setup axios instance
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      switch (error.response.status) {
        case 401:
          window.location.href = '/login.html';
          break;
        case 403:
          console.error('Forbidden: You do not have permission');
          break;
        case 404:
          console.error('Not Found: Resource does not exist');
          break;
        case 500:
          console.error('Server Error: Please try again later');
          break;
        default:
          console.error('Error:', error.response.data.message || 'An error occurred');
      }
    } else if (error.request) {
      console.error('Network Error: Please check your connection');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  },
);

const ApiService = {
  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {object} params - Query parameters
   * @returns {Promise}
   */
  get: async (url, params = {}) => {
    return await apiClient.get(url, { params });
  },

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @returns {Promise}
   */
  post: async (url, data = {}) => {
    return await apiClient.post(url, data);
  },

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @returns {Promise}
   */
  put: async (url, data = {}) => {
    return await apiClient.put(url, data);
  },

  /**
   * PATCH request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @returns {Promise}
   */
  patch: async (url, data = {}) => {
    return await apiClient.patch(url, data);
  },

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @returns {Promise}
   */
  delete: async (url) => {
    return await apiClient.delete(url);
  },
};

/**
 * Fetch API alternative (if don't want to use axios)
 */
const FetchService = {
  get: async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
    }
  },

  post: async (url, data = {}) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
    }
  },
};

// Export
export default ApiService;
export { ApiService, FetchService, apiClient };
