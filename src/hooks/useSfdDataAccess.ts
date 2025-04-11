
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

type SfdData = {
  id: string;
  name: string;
  region?: string;
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive' | string;
};

export function useSfdDataAccess() {
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  // Récupérer la SFD active depuis le localStorage au chargement
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Persister la SFD active dans le localStorage lorsqu'elle change
  useEffect(() => {
    if (activeSfdId) {
      console.log('Setting active SFD ID in localStorage:', activeSfdId);
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  // Récupérer les SFDs associées à l'utilisateur
  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching SFDs for user:', user.id);
        
        // Récupérer les SFDs associées à l'utilisateur depuis user_sfds
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id, is_default')
          .eq('user_id', user.id);
          
        if (userSfdsError) {
          console.error('Error fetching user SFDs:', userSfdsError);
          throw userSfdsError;
        }
        
        // Si l'utilisateur a des SFDs, récupérer leurs détails
        if (userSfds && userSfds.length > 0) {
          const sfdIds = userSfds.map(item => item.sfd_id);
          
          const { data: sfdsData, error: sfdsError } = await supabase
            .from('sfds')
            .select('*')
            .in('id', sfdIds);
            
          if (sfdsError) {
            console.error('Error fetching SFDs details:', sfdsError);
            throw sfdsError;
          }
          
          if (sfdsData) {
            setSfdData(sfdsData as SfdData[]);
            
            // Si aucune SFD active n'est définie, définir la SFD par défaut comme active
            if (!activeSfdId && userSfds.length > 0) {
              // Chercher d'abord une SFD marquée comme "default"
              const defaultSfd = userSfds.find(sfd => sfd.is_default);
              
              if (defaultSfd) {
                console.log('Setting default SFD as active:', defaultSfd.sfd_id);
                setActiveSfdId(defaultSfd.sfd_id);
              } else {
                // Si aucune SFD par défaut, prendre la première
                console.log('No default SFD found, setting first SFD as active:', userSfds[0].sfd_id);
                setActiveSfdId(userSfds[0].sfd_id);
              }
            }
          }
        } else {
          console.log('User has no associated SFDs');
          setSfdData([]);
        }
      } catch (err: any) {
        console.error('Error in fetchSfds:', err);
        setError(err.message);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les SFDs associées à votre compte",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, [user, toast, activeSfdId]);

  // Fonction pour changer la SFD active
  const setActiveSfd = useCallback((sfdId: string) => {
    console.log('Changing active SFD to:', sfdId);
    setActiveSfdId(sfdId);
    toast({
      title: "SFD Changée",
      description: "La SFD active a été modifiée",
    });
  }, [toast]);

  // Added missing functions used in other components
  const switchActiveSfd = useCallback(async (sfdId: string): Promise<boolean> => {
    if (!sfdData.find(sfd => sfd.id === sfdId)) {
      toast({
        title: "Erreur",
        description: "La SFD n'existe pas ou n'est pas accessible",
        variant: "destructive",
      });
      return false;
    }
    
    setActiveSfdId(sfdId);
    
    toast({
      title: "SFD Modifiée",
      description: "La SFD active a été changée avec succès",
    });
    
    return true;
  }, [sfdData, toast]);

  const getActiveSfdData = useCallback(async (): Promise<SfdData | null> => {
    if (!activeSfdId) return null;
    return sfdData.find(s => s.id === activeSfdId) || null;
  }, [activeSfdId, sfdData]);

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
      // Check if the SFD exists
      const { data: sfdExists, error: sfdError } = await supabase
        .from('sfds')
        .select('id')
        .eq('id', sfdId)
        .single();

      if (sfdError || !sfdExists) {
        throw new Error("SFD non trouvée");
      }

      // Check if user is already associated with this SFD
      const { data: existingAssoc, error: assocError } = await supabase
        .from('user_sfds')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId);

      if (assocError) throw assocError;

      if (existingAssoc && existingAssoc.length > 0) {
        // Update existing association if default status changed
        if (isDefault !== existingAssoc[0].is_default) {
          // If setting as default, first remove default from all others
          if (isDefault) {
            await supabase
              .from('user_sfds')
              .update({ is_default: false })
              .eq('user_id', user.id);
          }

          // Update this association
          await supabase
            .from('user_sfds')
            .update({ is_default: isDefault })
            .eq('id', existingAssoc[0].id);
        }
      } else {
        // If setting as default, first remove default from all others
        if (isDefault) {
          await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', user.id);
        }

        // Create new association
        await supabase
          .from('user_sfds')
          .insert({
            user_id: user.id,
            sfd_id: sfdId,
            is_default: isDefault
          });
      }

      // Refresh SFD data
      const { data: sfdsData, error: sfdsError } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', sfdId);

      if (sfdsError) throw sfdsError;

      // Set as active SFD
      if (sfdsData && sfdsData.length > 0) {
        setSfdData(prevData => {
          // Update or add the new SFD
          const exists = prevData.some(s => s.id === sfdId);
          if (exists) {
            return prevData.map(s => s.id === sfdId ? sfdsData[0] as SfdData : s);
          } else {
            return [...prevData, sfdsData[0] as SfdData];
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
    isLoading,
    error,
    setActiveSfd,
    // Additional functions needed by other components
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  };
}

export type { SfdData };
