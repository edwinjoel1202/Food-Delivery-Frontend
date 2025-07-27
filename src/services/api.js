import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors from backend
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific backend errors (e.g., from GlobalExceptionHandler)
      const message = error.response.data || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Network error'));
  }
);

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

export default API;