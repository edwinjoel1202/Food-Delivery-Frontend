import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const searchRestaurants = (params) => api.get('/discovery/search', { params });
export const getPopularRestaurants = () => api.get('/discovery/popular');
export const getFavoriteRestaurants = () => api.get('/favorites');
export const getCurrentUser = () => api.get('/users/me');

export default api;