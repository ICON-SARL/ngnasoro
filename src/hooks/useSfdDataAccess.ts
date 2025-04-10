
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
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Persister la SFD active dans le localStorage lorsqu'elle change
  useEffect(() => {
    if (activeSfdId) {
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
            .select('id, name, code, region, logo_url, status')
            .in('id', sfdIds);
            
          if (sfdsError) {
            console.error('Error fetching SFDs details:', sfdsError);
            throw sfdsError;
          }
          
          setSfdData(sfdsData || []);
          
          // Si aucune SFD active n'est définie, utiliser la SFD par défaut ou la première
          if (!activeSfdId && sfdsData && sfdsData.length > 0) {
            // Trouver la SFD par défaut
            const defaultSfd = userSfds.find(item => item.is_default);
            if (defaultSfd) {
              setActiveSfdId(defaultSfd.sfd_id);
            } else {
              setActiveSfdId(sfdsData[0].id);
            }
          }
        } else {
          // L'utilisateur n'a pas de SFD associée
          console.log('User has no associated SFDs');
          setSfdData([]);
          setActiveSfdId(null);
        }
      } catch (error) {
        console.error('Error fetching SFD data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        // Si une erreur se produit, utiliser les données de mock
        const mockSfds: SfdData[] = [
          {
            id: 'primary-sfd',
            name: 'SFD Primaire',
            code: 'primary-sfd',
            region: 'Bamako',
            status: 'active'
          },
          {
            id: 'secondary-sfd',
            name: 'SFD Secondaire',
            code: 'secondary-sfd',
            region: 'Sikasso',
            status: 'active'
          }
        ];
        
        setSfdData(mockSfds);
        
        if (!activeSfdId && mockSfds.length > 0) {
          setActiveSfdId(mockSfds[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, [user, activeSfdId]);

  // Fonction pour changer la SFD active
  const switchActiveSfd = useCallback((sfdId: string) => {
    setActiveSfdId(sfdId);
    toast({
      title: "SFD active changée",
      description: "Votre SFD active a été mise à jour",
    });
    return Promise.resolve(true);
  }, [toast]);

  // Fonction pour récupérer les données de la SFD active
  const getActiveSfdData = useCallback(async (): Promise<SfdData | null> => {
    if (!activeSfdId || !sfdData.length) return null;
    return sfdData.find(sfd => sfd.id === activeSfdId) || null;
  }, [activeSfdId, sfdData]);
  
  // Fonction pour associer un utilisateur à une SFD
  const associateUserWithSfd = useCallback(async (sfdId: string, isDefault: boolean = false): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Vérifier si l'association existe déjà
      const { data: existingAssoc, error: checkError } = await supabase
        .from('user_sfds')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = "no rows returned"
        console.error('Error checking SFD association:', checkError);
        return false;
      }
      
      // Si l'association existe déjà, la mettre à jour si nécessaire
      if (existingAssoc) {
        if (isDefault) {
          // D'abord, mettre tous les is_default à false
          await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', user.id);
            
          // Ensuite, définir celle-ci comme par défaut
          const { error: updateError } = await supabase
            .from('user_sfds')
            .update({ is_default: true })
            .eq('id', existingAssoc.id);
            
          if (updateError) {
            console.error('Error updating default SFD:', updateError);
            return false;
          }
        }
      } else {
        // Si c'est la première SFD, la définir comme par défaut
        const { data: countData } = await supabase
          .from('user_sfds')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
          
        const shouldBeDefault = isDefault || (countData && countData.length === 0);
        
        // Si c'est défini comme par défaut, mettre les autres à false
        if (shouldBeDefault) {
          await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', user.id);
        }
        
        // Créer la nouvelle association
        const { error: insertError } = await supabase
          .from('user_sfds')
          .insert({
            user_id: user.id,
            sfd_id: sfdId,
            is_default: shouldBeDefault
          });
          
        if (insertError) {
          console.error('Error creating SFD association:', insertError);
          return false;
        }
      }
      
      // Mettre à jour l'état local
      if (isDefault) {
        setActiveSfdId(sfdId);
      }
      
      return true;
    } catch (error) {
      console.error('Error in associateUserWithSfd:', error);
      return false;
    }
  }, [user]);

  return {
    activeSfdId,
    setActiveSfdId,
    sfdData,
    isLoading,
    error,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  };
}
