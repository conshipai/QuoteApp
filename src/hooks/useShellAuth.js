// src/hooks/useShellAuth.js
import { useEffect } from 'react';
import axios from 'axios';

export function useShellAuth() {
  useEffect(() => {
    // Try to get auth from multiple sources
    const setupAuth = () => {
      // Method 1: From shellContext
      if (window.shellContext?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${window.shellContext.token}`;
        console.log('Quotes: Set token from shellContext');
        return;
      }
      
      // Method 2: From shellAuth (the service)
      if (window.shellAuth?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${window.shellAuth.token}`;
        console.log('Quotes: Set token from shellAuth');
        return;
      }
      
      // Method 3: From localStorage (fallback)
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Quotes: Set token from localStorage');
        return;
      }
      
      console.warn('Quotes: No token found!');
    };

    // Set up initially
    setupAuth();

    // Listen for updates from Shell
    const handleAuthUpdate = (event) => {
      if (event.detail?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${event.detail.token}`;
        console.log('Quotes: Updated token from shell event');
      }
    };

    window.addEventListener('shell-auth-updated', handleAuthUpdate);
    
    return () => {
      window.removeEventListener('shell-auth-updated', handleAuthUpdate);
    };
  }, []);
}
