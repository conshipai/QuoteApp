// src/bootstrap.js
import React from 'react';
import axios from 'axios';
import QuotesModule from './QuotesModule';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.gcc.conship.ai';
axios.defaults.baseURL = API_BASE_URL;

// Set up initial auth from Shell
const setupAuth = () => {
  if (window.shellContext?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${window.shellContext.token}`;
    console.log('Quotes app: Set token from shellContext');
  } else if (window.shellAuth?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${window.shellAuth.token}`;
    console.log('Quotes app: Set token from shellAuth');
  } else {
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Quotes app: Set token from localStorage');
    } else {
      console.warn('Quotes app: No token found on initialization');
    }
  }
};

// Initialize auth
setupAuth();

// Listen for auth updates from Shell
window.addEventListener('shell-auth-updated', (event) => {
  if (event.detail?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${event.detail.token}`;
    console.log('Quotes app: Updated token from shell event');
  }
});

// Make axios available for debugging
window.quotesAxios = axios;

export default QuotesModule;
