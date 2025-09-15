// src/hooks/useUserRole.js - FIXED VERSION
export default function useUserRole() {
  // Get user from multiple possible sources with fallbacks
  const user = window.shellContext?.user || 
               window.shellAuth?.user || 
               JSON.parse(localStorage.getItem('user') || 'null');
  
  // Debug
  if (!user) {
    console.warn('useUserRole: No user found in context');
    return 'guest'; // Return a default role
  }
  
  console.log('useUserRole: User found:', user.email, 'Role:', user.role);
  
  // Return the user's role
  return user.role || user.userRole || 'guest';
}
