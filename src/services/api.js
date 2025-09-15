// src/services/api.js - DEBUG VERSION
import axios from 'axios';

// Debug function to inspect token
const debugToken = (token) => {
  if (token) {
    console.log('Token details:', {
      length: token.length,
      startsWith: token.substring(0, 20),
      includesBearer: token.includes('Bearer'),
      isJWT: token.split('.').length === 3
    });
  }
  return token;
};

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
