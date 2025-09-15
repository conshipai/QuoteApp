// src/hooks/useShellAuth.js - FULLY FIXED VERSION
import { useEffect } from 'react';
import axios from 'axios';

export function useShellAuth() {
  useEffect(() => {
    const setupAuth = () => {
      let token = window.shellContext?.token || 
                   window.shellAuth?.token || 
                   localStorage.getItem('auth_token');
      
      if (token) {
        // Debug the token
        console.log('=== QUOTES AUTH DEBUG ===');
        console.log('Token found, length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
        console.log('Token has Bearer:', token.includes('Bearer'));
        
        // Don't add Bearer if it's already there
        if (token.startsWith('Bearer ')) {
          axios.defaults.headers.common['Authorization'] = token;
        } else {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        localStorage.setItem('auth_token', token);
        console.log('Quotes: Auth configured');
      } else {
        console.warn('Quotes: No token found!');
      }
    };

    setupAuth();
    
    const handleAuthUpdate = (event) => {
      if (event.detail?.token) {
        const token = event.detail.token;
        axios.defaults.headers.common['Authorization'] = 
          token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        localStorage.setItem('auth_token', token);
      }
    };

    window.addEventListener('shell-auth-updated', handleAuthUpdate);
    return () => window.removeEventListener('shell-auth-updated', handleAuthUpdate);
  }, []);

  // ALWAYS return a valid object with all expected properties
  return {
    isDarkMode: window.shellContext?.theme === 'dark' || false,
    token: window.shellContext?.token || localStorage.getItem('auth_token') || null,
    user: window.shellContext?.user || null,
    isAuthenticated: !!(window.shellContext?.token || localStorage.getItem('auth_token'))
  };
}
