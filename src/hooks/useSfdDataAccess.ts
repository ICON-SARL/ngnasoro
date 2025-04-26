
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserSfds } from '@/hooks/sfd/fetchSfdAccounts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useSfdDataAccess() {
  const { user, activeSfdId: authActiveSfdId, setActiveSfdId: authSetActiveSfdId } = useAuth();
  const [sfds, setSfds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
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
  
  const getActiveSfd = useCallback(() => {
    if (!activeSfdId || !sfds.length) return null;
    return sfds.find(sfd => sfd.id === activeSfdId) || null;
  }, [activeSfdId, sfds]);

  const getActiveSfdData = useCallback(async () => {
    const activeSfd = getActiveSfd();
    return activeSfd;
  }, [getActiveSfd]);
  
  const switchActiveSfd = useCallback(async (sfdId: string) => {
    if (sfdId === activeSfdId) return true;
    
    try {
      authSetActiveSfdId(sfdId);
      
      toast({
        title: "SFD changée",
        description: `Vous êtes maintenant connecté à une autre SFD`,
      });
      
      return true;
    } catch (error) {
      console.error("Error switching SFD:", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer de SFD",
        variant: "destructive"
      });
      return false;
    }
  }, [activeSfdId, authSetActiveSfdId, toast]);

  const associateUserWithSfd = useCallback(async (sfdId: string, isDefault: boolean = false) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_sfds')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          is_default: isDefault
        });
      
      if (error) throw error;
      
      // Reload SFDs
      const userSfds = await fetchUserSfds(user.id);
      setSfds(userSfds);
      
      // If it's the default SFD, set it as active
      if (isDefault) {
        authSetActiveSfdId(sfdId);
      }
      
      toast({
        title: "Association réussie",
        description: "Vous avez été associé à cette SFD avec succès"
      });
      
      return true;
    } catch (error) {
      console.error("Error associating user with SFD:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vous associer à cette SFD",
        variant: "destructive"
      });
      return false;
    }
  }, [user, authSetActiveSfdId, toast]);
  
  return {
    sfds,
    sfdData: sfds, // Alias for backward compatibility
    isLoading,
    activeSfdId,
    setActiveSfdId: authSetActiveSfdId,
    activeSfd: getActiveSfd(),
    getActiveSfd,
    getActiveSfdData,
    switchActiveSfd,
    associateUserWithSfd
  };
}
