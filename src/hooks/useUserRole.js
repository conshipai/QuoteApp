import { useState, useEffect } from 'react';

const useUserRole = ({ user }) => {
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    if (user?.role) {
      // Map shell roles to quote module roles
      if (user.role === 'partner_master' || user.role === 'partner_user') {
        setUserRole('foreign_agent');
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
