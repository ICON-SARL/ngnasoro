
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserSfds } from '@/hooks/sfd/fetchSfdAccounts';

export function useSfdDataAccess() {
  const { user, activeSfdId: authActiveSfdId, setActiveSfdId: authSetActiveSfdId } = useAuth();
  const [sfds, setSfds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Use activeSfdId from auth context
  const activeSfdId = authActiveSfdId;
  
  useEffect(() => {
    const loadSfds = async () => {
      if (!user) {
        setSfds([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userSfds = await fetchUserSfds(user.id);
        setSfds(userSfds);
        
        // If no active SFD is set but we have SFDs available, set the first one as active
        if (!activeSfdId && userSfds.length > 0) {
          const defaultSfd = userSfds.find(sfd => sfd.is_default) || userSfds[0];
          authSetActiveSfdId(defaultSfd.id);
        }
      } catch (error) {
        console.error("Error loading SFDs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSfds();
  }, [user, authSetActiveSfdId, activeSfdId]);
  
  const getActiveSfd = () => {
    if (!activeSfdId || !sfds.length) return null;
    return sfds.find(sfd => sfd.id === activeSfdId) || null;
  };
  
  return {
    sfds,
    isLoading,
    activeSfdId,
    setActiveSfdId: authSetActiveSfdId,
    activeSfd: getActiveSfd(),
  };
}
