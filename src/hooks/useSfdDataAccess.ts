
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
        console.log('Loading SFDs for user:', user.id);
        
        // First try to get SFDs from user_sfds table
        let { data: userSfdAssociations, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select(`
            sfd_id,
            is_default,
            sfds:sfd_id (
              id,
              name,
              code,
              region,
              status,
              logo_url
            )
          `)
          .eq('user_id', user.id);
          
        if (userSfdsError) {
          console.error('Error fetching user SFDs associations:', userSfdsError);
        }
        
        // If we have associations, format them
        if (userSfdAssociations && userSfdAssociations.length > 0) {
          console.log('Found user SFD associations:', userSfdAssociations.length);
          
          // Transform the data structure to match expected format
          const formattedSfds = userSfdAssociations
            .filter(item => item.sfds) // Ensure SFD exists
            .map(item => ({
              id: item.sfds.id,
              name: item.sfds.name,
              code: item.sfds.code,
              region: item.sfds.region || '',
              status: item.sfds.status,
              logo_url: item.sfds.logo_url,
              is_default: item.is_default
            }));
            
          setSfds(formattedSfds);
          
          // If no active SFD is set but we have SFDs available, set the default one as active
          if (!activeSfdId && formattedSfds.length > 0) {
            const defaultSfd = formattedSfds.find(sfd => sfd.is_default) || formattedSfds[0];
            console.log('Setting default SFD as active:', defaultSfd.name);
            authSetActiveSfdId(defaultSfd.id);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Fallback to fetchUserSfds if no associations found
        console.log('No associations found, using fetchUserSfds');
        const userSfds = await fetchUserSfds(user.id);
        setSfds(userSfds);
        
        // If no active SFD is set but we have SFDs available, set the first one as active
        if (!activeSfdId && userSfds.length > 0) {
          const defaultSfd = userSfds.find(sfd => sfd.is_default) || userSfds[0];
          console.log('Setting first SFD as active:', defaultSfd.name);
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
      console.log('Switching active SFD to:', sfdId);
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
      console.log('Associating user with SFD:', { userId: user.id, sfdId, isDefault });
      const { error } = await supabase
        .from('user_sfds')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          is_default: isDefault
        });
      
      if (error) throw error;
      
      // If it's the default SFD, update other associations to not be default
      if (isDefault) {
        await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('sfd_id', sfdId);
      }
      
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
