// src/hooks/useShellAuth.js - FIXED VERSION
import { useEffect, useState } from 'react';
import axios from 'axios';

export function useShellAuth() {
  // Add state for the values we need to return
  const [authState, setAuthState] = useState({
    isDarkMode: window.shellContext?.theme === 'dark' || false,
    token: null,
    user: window.shellContext?.user || null,
    isAuthenticated: false
  });

  useEffect(() => {
    // Try to get auth from multiple sources
    const setupAuth = () => {
      let token = null;
      
      // Method 1: From shellContext
      if (window.shellContext?.token) {
        token = window.shellContext.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('auth_token', token); // Store for backup
        console.log('Quotes: Set token from shellContext');
      }
      // Method 2: From shellAuth (the service)
      else if (window.shellAuth?.token) {
        token = window.shellAuth.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('auth_token', token);
        console.log('Quotes: Set token from shellAuth');
      }
      // Method 3: From localStorage (fallback)
      else {
        token = localStorage.getItem('auth_token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Quotes: Set token from localStorage');
        } else {
          console.warn('Quotes: No token found!');
        }
      }
      
      // Update state with the token and other values
      setAuthState({
        isDarkMode: window.shellContext?.theme === 'dark' || false,
        token: token,
        user: window.shellContext?.user || null,
        isAuthenticated: !!token
      });

      // DEBUG: Log what we found
      console.log('=== AUTH DEBUG ===');
      console.log('Token found:', !!token);
      if (token) {
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 30) + '...');
        console.log('Token has Bearer prefix:', token.startsWith('Bearer '));
      }
    };

    // Set up initially
    setupAuth();
    
    // Listen for updates from Shell
    const handleAuthUpdate = (event) => {
      if (event.detail?.token) {
        const newToken = event.detail.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        localStorage.setItem('auth_token', newToken);
        console.log('Quotes: Updated token from shell event');
        
        // Update state
        setAuthState(prev => ({
          ...prev,
          token: newToken,
          isAuthenticated: true
        }));
      }
    };

    // Listen for theme changes too
    const handleThemeUpdate = (event) => {
      if (event.detail?.theme) {
        setAuthState(prev => ({
          ...prev,
          isDarkMode: event.detail.theme === 'dark'
        }));
      }
    };

    window.addEventListener('shell-auth-updated', handleAuthUpdate);
    window.addEventListener('shell-theme-updated', handleThemeUpdate);
    
    return () => {
      window.removeEventListener('shell-auth-updated', handleAuthUpdate);
      window.removeEventListener('shell-theme-updated', handleThemeUpdate);
    };
  }, []);

  // IMPORTANT: Return the values that components need!
  return authState;
}
