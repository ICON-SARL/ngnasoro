
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ClientAdhesionRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

export const useClientAdhesions = () => {
  const { user } = useAuth();
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingUserAdhesionRequests, setIsLoadingUserAdhesionRequests] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAdhesionRequests = useCallback(async () => {
    if (!user) return [];
    
    setIsLoadingUserAdhesionRequests(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('id, sfd_id, status, created_at, notes, sfds(name)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        sfd_id: item.sfd_id,
        sfd_name: item.sfds?.name,
        status: item.status,
        created_at: item.created_at,
        notes: item.notes
      }));
      
      setUserAdhesionRequests(formattedData);
      return formattedData;
    } catch (err) {
      console.error('Error fetching user adhesion requests:', err);
      setError('Impossible de récupérer vos demandes d\'adhésion');
      return [];
    } finally {
      setIsLoadingUserAdhesionRequests(false);
    }
  }, [user]);

  const refetchUserAdhesionRequests = useCallback(async () => {
    return await fetchUserAdhesionRequests();
  }, [fetchUserAdhesionRequests]);

  useEffect(() => {
    fetchUserAdhesionRequests();
  }, [fetchUserAdhesionRequests]);

  const submitAdhesionRequest = async (sfdId: string, formData: any) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };
    
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert([
          {
            user_id: user.id,
            sfd_id: sfdId,
            status: 'pending',
            client_data: formData
          }
        ])
        .select();
      
      if (error) throw error;
      
      await refetchUserAdhesionRequests();
      return { success: true, data };
    } catch (err) {
      console.error('Error submitting adhesion request:', err);
      return { success: false, error: 'Impossible de soumettre votre demande d\'adhésion' };
    }
  };

  return {
    userAdhesionRequests,
    isLoadingUserAdhesionRequests,
    error,
    refetchUserAdhesionRequests,
    submitAdhesionRequest
  };
};
