// src/services/api.js
import api from './api';

// Use Shell's axios if available, otherwise create our own
const api = window.shellAxios || axios.create({
  baseURL: 'https://api.gcc.conship.ai/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

// If not using shell's axios, add interceptor for fresh token
if (!window.shellAxios) {
  api.interceptors.request.use((config) => {
    const token = window.shellAuth?.token || 
                  window.shellContext?.token || 
                  localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}

export default api;
