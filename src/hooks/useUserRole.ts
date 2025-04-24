
import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    if (user) {
      const role = user.app_metadata?.role || user.user_metadata?.role;
      setIsAdmin(role === 'admin' || role === 'super_admin');
      setIsSfdAdmin(role === 'sfd_admin');
      setIsClient(role === 'client' || !role); // Default to client if no role specified
    } else {
      setIsAdmin(false);
      setIsSfdAdmin(false);
      setIsClient(false);
    }
  }, [user]);
  
  return {
    isAdmin,
    isSfdAdmin,
    isClient
  };
}
