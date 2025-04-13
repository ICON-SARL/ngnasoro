
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SfdData } from './types';
import { useSfdTokenManager } from './useSfdTokenManager';
import { useSfdDataFetcher } from './useSfdDataFetcher';

export function useSfdDataAccessCore() {
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the sub-hooks
  const { loading: fetchLoading, error: fetchError, fetchUserSfds } = useSfdDataFetcher(setSfdData);
  const { generateTokenForSfd, refreshTokenIfNeeded } = useSfdTokenManager(sfdData, setSfdData);

  // Load stored SFD ID from localStorage on mount
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Save active SFD ID to localStorage when it changes
  useEffect(() => {
    if (activeSfdId) {
      console.log('Setting active SFD ID in localStorage:', activeSfdId);
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  // Fetch SFDs on component mount
  useEffect(() => {
    if (user) {
      const initializeSfds = async () => {
        setIsLoading(true);
        try {
          await fetchUserSfds(user);
          
          // If we have SFDs but no active one is set, set the default one (or first) as active
          if (sfdData.length > 0 && !activeSfdId) {
            // Fetch is_default from the database
            const { data } = await supabase
              .from('user_sfds')
              .select('sfd_id, is_default')
              .eq('user_id', user.id);
              
            const defaultSfd = data?.find(item => item.is_default);
            if (defaultSfd) {
              setActiveSfdId(defaultSfd.sfd_id);
            } else if (sfdData[0]) {
              setActiveSfdId(sfdData[0].id);
            }
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      initializeSfds();
    } else {
      setIsLoading(false);
    }
  }, [user, activeSfdId, sfdData.length, fetchUserSfds]);

  // Switch the active SFD
  const switchActiveSfd = useCallback(async (sfdId: string): Promise<boolean> => {
    if (!user) return false;
    
    if (!sfdData.find(sfd => sfd.id === sfdId)) {
      toast({
        title: "Erreur",
        description: "La SFD n'existe pas ou n'est pas accessible",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      if (user?.id) {
        const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
          body: { 
            userId: user.id,
            sfdId: sfdId,
            forceSync: true 
          }
        });
        
        if (error) {
          console.error("Error synchronizing before switch:", error);
        } else {
          console.log("Pre-switch synchronization result:", data);
        }
      }
      
      setActiveSfdId(sfdId);
      
      if (user?.id) {
        await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', user.id);
        
        await supabase
          .from('user_sfds')
          .update({ is_default: true })
          .eq('user_id', user.id)
          .eq('sfd_id', sfdId);
      }
      
      toast({
        title: "SFD Modifiée",
        description: "La SFD active a été changée avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("Error in switchActiveSfd:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du changement de SFD",
        variant: "destructive",
      });
      return false;
    }
  }, [sfdData, user, toast]);

  // Simple setter for active SFD
  const setActiveSfd = useCallback((sfdId: string) => {
    console.log('Changing active SFD to:', sfdId);
    setActiveSfdId(sfdId);
    toast({
      title: "SFD Changée",
      description: "La SFD active a été modifiée",
    });
  }, [toast]);

  // Get current active SFD data
  const getActiveSfdData = useCallback(async (): Promise<SfdData | null> => {
    if (!activeSfdId) return null;
    return sfdData.find(s => s.id === activeSfdId) || null;
  }, [activeSfdId, sfdData]);

  // Associate user with a SFD
  const associateUserWithSfd = useCallback(async (sfdId: string, isDefault: boolean = false): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour associer une SFD",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: sfdExists, error: sfdError } = await supabase
        .from('sfds')
        .select('id')
        .eq('id', sfdId)
        .single();

      if (sfdError || !sfdExists) {
        throw new Error("SFD non trouvée");
      }

      const { data: existingAssoc, error: assocError } = await supabase
        .from('user_sfds')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId);

      if (assocError) throw assocError;

      if (existingAssoc && existingAssoc.length > 0) {
        if (isDefault !== existingAssoc[0].is_default) {
          if (isDefault) {
            await supabase
              .from('user_sfds')
              .update({ is_default: false })
              .eq('user_id', user.id);
          }

          await supabase
            .from('user_sfds')
            .update({ is_default: isDefault })
            .eq('id', existingAssoc[0].id);
        }
      } else {
        if (isDefault) {
          await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', user.id);
        }

        await supabase
          .from('user_sfds')
          .insert({
            user_id: user.id,
            sfd_id: sfdId,
            is_default: isDefault
          });
      }

      const { data: sfdsData, error: sfdsError } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', sfdId);

      if (sfdsError) throw sfdsError;

      if (sfdsData && sfdsData.length > 0) {
        setSfdData(prevData => {
          const exists = prevData.some(s => s.id === sfdId);
          if (exists) {
            return prevData.map(s => s.id === sfdId ? {...sfdsData[0], is_default: isDefault} as SfdData : s);
          } else {
            return [...prevData, {...sfdsData[0], is_default: isDefault} as SfdData];
          }
        });

        setActiveSfdId(sfdId);
      }

      return true;
    } catch (err: any) {
      console.error('Error associating user with SFD:', err);
      toast({
        title: "Erreur",
        description: `Impossible d'associer la SFD: ${err.message}`,
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  return {
    activeSfdId,
    sfdData,
    isLoading: isLoading || fetchLoading,
    error: error || fetchError,
    setActiveSfd,
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  };
}
