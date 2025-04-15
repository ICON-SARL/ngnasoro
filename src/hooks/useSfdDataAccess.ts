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

  // Retrieve stored SFD ID on mount
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId && storedSfdId.trim() !== '') {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Save SFD ID to localStorage when it changes
  useEffect(() => {
    if (activeSfdId && activeSfdId.trim() !== '') {
      console.log('Setting active SFD ID in localStorage:', activeSfdId);
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  // Fetch SFDs for the current user
  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching SFDs for user:', user.id);
        
        // First try direct database query for all active SFDs
        const { data: directSfds, error: directError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
          
        if (directError) {
          console.error('Error fetching SFDs directly:', directError);
        } else if (directSfds && directSfds.length > 0) {
          console.log(`Found ${directSfds.length} active SFDs directly`);
          setSfdData(directSfds);
          
          // If no active SFD is set and we have SFDs, set the first one as active
          if ((!activeSfdId || activeSfdId.trim() === '') && directSfds.length > 0) {
            console.log('Setting first SFD as active:', directSfds[0].id);
            setActiveSfdId(directSfds[0].id);
          }
          
          setIsLoading(false);
          return;
        }
        
        // If direct query fails, try the edge function
        const { data, error } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user.id }
        });
          
        if (error) {
          console.error('Error fetching SFDs from edge function:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No SFDs returned from edge function');
          setSfdData([]);
          return;
        }
        
        // Handle potential error returned in data
        if (data.error) {
          console.error('Error returned by the edge function:', data.error);
          throw new Error(data.error);
        }
        
        console.log('SFDs retrieved:', data);
        
        // Transform data if necessary
        const formattedSfds = Array.isArray(data) ? data : [];
        setSfdData(formattedSfds);
        
        // If no active SFD is defined and we have SFDs, set the first one as active
        if ((!activeSfdId || activeSfdId.trim() === '') && formattedSfds.length > 0) {
          // Look for a default SFD, otherwise take the first one
          const defaultSfd = formattedSfds.find(sfd => sfd.is_default);
          
          if (defaultSfd) {
            console.log('Setting default SFD as active:', defaultSfd.id);
            setActiveSfdId(defaultSfd.id);
          } else if (formattedSfds.length > 0) {
            console.log('No default SFD found, setting first SFD as active:', formattedSfds[0].id);
            setActiveSfdId(formattedSfds[0].id);
          }
        }
      } catch (err: any) {
        console.error('Error in fetchSfds:', err);
        setError(err.message);
        
        // Add fallback data for development
        setSfdData([
          {
            id: 'test-sfd1',
            name: 'RMCR (Test)',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            token: null,
            lastFetched: null
          },
          {
            id: 'test-sfd2',
            name: 'NYESIGISO (Test)',
            code: 'NYESIGISO',
            region: 'Sud',
            status: 'active',
            token: null,
            lastFetched: null
          }
        ]);
        
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

  // Update active SFD
  const setActiveSfd = useCallback((sfdId: string) => {
    if (!sfdId || sfdId.trim() === '') {
      console.warn('Attempted to set an empty SFD ID');
      return;
    }
    
    console.log('Changing active SFD to:', sfdId);
    setActiveSfdId(sfdId);
    toast({
      title: "SFD Changée",
      description: "La SFD active a été modifiée",
    });
  }, [toast]);

  // Switch active SFD with validation
  const switchActiveSfd = useCallback(async (sfdId: string): Promise<boolean> => {
    if (!sfdId || sfdId.trim() === '') {
      console.warn('Attempted to switch to an empty SFD ID');
      toast({
        title: "Erreur",
        description: "Identifiant SFD invalide",
        variant: "destructive",
      });
      return false;
    }
    
    if (!sfdData.find(sfd => sfd.id === sfdId)) {
      toast({
        title: "Erreur",
        description: "La SFD n'existe pas ou n'est pas accessible",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setActiveSfdId(sfdId);
      
      if (user?.id) {
        // Utiliser la fonction Edge pour définir la SFD par défaut
        const { data, error } = await supabase.functions.invoke('fetch-sfds', {
          body: { 
            userId: user.id,
            sfdId: sfdId,
            action: 'setDefault'
          }
        });
        
        if (error) {
          console.error("Error setting default SFD:", error);
        }
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
      // Utiliser la fonction Edge pour associer l'utilisateur à une SFD
      const { data, error } = await supabase.functions.invoke('associate-sfd-admin', {
        body: { 
          adminId: user.id,
          sfdId,
          makeDefault: isDefault
        }
      });
      
      if (error) throw error;
      
      if (!data || data.error) {
        throw new Error(data?.error || "Erreur lors de l'association avec la SFD");
      }
      
      // Mettre à jour le state local
      const { data: sfdDetails } = await supabase.functions.invoke('fetch-sfds', {
        body: { sfdId }
      });
      
      if (sfdDetails && Array.isArray(sfdDetails) && sfdDetails.length > 0) {
        setSfdData(prevData => {
          // Si la SFD existe déjà, mettre à jour ses données
          if (prevData.some(s => s.id === sfdId)) {
            return prevData.map(s => s.id === sfdId ? sfdDetails[0] : s);
          }
          // Sinon, ajouter la nouvelle SFD
          return [...prevData, sfdDetails[0]];
        });
      }
      
      if (isDefault) {
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
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  };
}

export type { SfdData };
