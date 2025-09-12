// src/hooks/useShellAuth.js (in Quotes module)
import { useState, useEffect } from 'react';

/**
 * Hook to access shell authentication in micro-apps
 * This connects to the parent shell's auth service
 */
export function useShellAuth() {
  const [auth, setAuth] = useState(() => {
    // Get initial auth state from shell
    if (window.shellAuth) {
      return window.shellAuth.getAuthState();
    }
    return { token: null, user: null, isAuthenticated: false };
  });

  useEffect(() => {
    // Function to update auth state
    const updateAuth = () => {
      if (window.shellAuth) {
        const newAuth = window.shellAuth.getAuthState();
        setAuth(newAuth);
        
        // Also update axios headers in the micro-app
        if (window.axios && newAuth.token) {
          window.axios.defaults.headers.common['Authorization'] = `Bearer ${newAuth.token}`;
        }
      }
    };

    // Listen for auth updates from shell
    const handleAuthUpdate = (event) => {
      console.log('Micro-app: Received auth update', event.detail);
      updateAuth();
    };

    // Initial update
    updateAuth();

    // Listen for changes
    window.addEventListener('shell-auth-updated', handleAuthUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('shell-auth-updated', handleAuthUpdate);
    };
  }, []);

  return {
    ...auth,
    isLoading: false,
    hasRole: (roles) => window.shellAuth?.hasRole(roles) || false
  };
}
