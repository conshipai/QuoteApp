// src/services/api.js - FIXED
import axios from 'axios';

// Create axios instance
const api = window.shellAxios || axios.create({
  baseURL: 'https://api.gcc.conship.ai/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Always add fresh token interceptor (even for shellAxios)
api.interceptors.request.use(
  (config) => {
    // Get fresh token every time
    const token = window.shellAuth?.token || 
                  window.shellContext?.token || 
                  localStorage.getItem('auth_token');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers['Authorization'],
      tokenLength: token ? token.length : 0
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.error('Auth token invalid or expired');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
