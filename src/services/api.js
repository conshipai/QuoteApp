// src/services/api.js - DEBUG VERSION
import axios from 'axios';

// ADD THIS DEBUG CODE AT THE TOP
if (window.shellAxios) {
  console.log('=== USING SHELL AXIOS ===');
  
  // Intercept shellAxios to see what it's sending
  const originalRequest = window.shellAxios.request;
  window.shellAxios.request = function(config) {
    console.log('ShellAxios Request:', {
      url: config.url,
      headers: config.headers,
      authHeader: config.headers?.Authorization ? config.headers.Authorization.substring(0, 50) + '...' : 'NO AUTH HEADER'
    });
    return originalRequest.call(this, config);
  };
}
// Create axios instance
const api = window.shellAxios || axios.create({
  baseURL: 'https://api.gcc.conship.ai/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Always add interceptor to handle tokens properly
api.interceptors.request.use(
  (config) => {
    // Try multiple token sources
    let token = window.shellAuth?.token || 
                window.shellContext?.token || 
                localStorage.getItem('auth_token');
    
    // Debug the token
    console.log('Token sources:', {
      shellAuth: !!window.shellAuth?.token,
      shellContext: !!window.shellContext?.token,
      localStorage: !!localStorage.getItem('auth_token')
    });
    
    if (token) {
      debugToken(token);
      
      // IMPORTANT: Check if token already includes 'Bearer'
      // Shell might provide "Bearer xxx" while backend expects just "xxx"
      if (token.startsWith('Bearer ')) {
        // Token already has Bearer prefix
        config.headers['Authorization'] = token;
      } else {
        // Add Bearer prefix
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Final auth header:', config.headers['Authorization'].substring(0, 30) + '...');
    } else {
      console.warn('No token available!');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Auth failed. Response:', error.response.data);
      
      // Try to get a fresh token from the shell
      if (window.shellAuth?.refreshToken) {
        console.log('Attempting to refresh token via shell...');
        window.shellAuth.refreshToken();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
