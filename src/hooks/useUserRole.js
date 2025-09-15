// src/hooks/useUserRole.js - FIXED
export default function useUserRole({ user } = {}) {
  // User can come from prop or from window context
  const actualUser = user || 
                     window.shellContext?.user || 
                     window.shellAuth?.user || 
                     JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!actualUser) {
    console.warn('useUserRole: No user found');
    return null; // Return null instead of 'guest' to trigger loading state
  }
  
  console.log('useUserRole: User found:', actualUser.email, 'Role:', actualUser.role);
  
  return actualUser.role || actualUser.userRole || 'user';
}
