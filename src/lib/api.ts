
import axios from 'axios';

// Create a base API instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response) {
      // Handle specific error cases as needed
      console.error('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
