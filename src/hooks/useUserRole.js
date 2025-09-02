import { useState, useEffect } from 'react';

const useUserRole = ({ user }) => {
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    if (user?.role) {
      // Map shell roles to quote module roles
     if (user.role === 'partner_admin' || user.role === 'partner_user') {
        setUserRole('partner');  // or 'customer' - we need to know which one the quotes app expects
      } else if (user.role === 'system_admin' || user.role === 'conship_employee') {
        setUserRole('admin');
      } else {
        setUserRole('customer');
      }
    } else {
      // Default
      setUserRole('customer');
    }
  }, [user]);
  
  return userRole;
};

export default useUserRole;
