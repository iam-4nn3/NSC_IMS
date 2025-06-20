// client/src/requests.js (or equivalent)
import axios from 'axios';
import { toast } from 'react-toastify';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Add request interceptor to attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add response interceptor to handle expired token
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login'; // redirect
    }
    return Promise.reject(error);
  }
);

export default api;
