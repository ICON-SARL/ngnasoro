
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
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [adhesionRequests, setAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(false);

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
        status: item.status as 'pending' | 'approved' | 'rejected',
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

  const fetchAdhesionRequests = useCallback(async () => {
    if (!user) return [];
    
    setIsLoadingAdhesionRequests(true);
    
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('id, sfd_id, status, created_at, notes, user_id')
        
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        sfd_id: item.sfd_id,
        user_id: item.user_id,
        status: item.status as 'pending' | 'approved' | 'rejected',
        created_at: item.created_at,
        notes: item.notes
      }));
      
      setAdhesionRequests(formattedData);
      return formattedData;
    } catch (err) {
      console.error('Error fetching adhesion requests:', err);
      return [];
    } finally {
      setIsLoadingAdhesionRequests(false);
    }
  }, [user]);

  const refetchUserAdhesionRequests = useCallback(async () => {
    return await fetchUserAdhesionRequests();
  }, [fetchUserAdhesionRequests]);

  const refetchAdhesionRequests = useCallback(async () => {
    return await fetchAdhesionRequests();
  }, [fetchAdhesionRequests]);

  useEffect(() => {
    fetchUserAdhesionRequests();
    fetchAdhesionRequests();
  }, [fetchUserAdhesionRequests, fetchAdhesionRequests]);

  const submitAdhesionRequest = async (sfdId: string, formData: any) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' };
    
    setIsCreatingRequest(true);
    
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert([
          {
            user_id: user.id,
            sfd_id: sfdId,
            status: 'pending',
            full_name: formData.full_name || user.user_metadata?.full_name || '',
            email: formData.email || user.email || '',
            phone: formData.phone || '',
            address: formData.address || '',
          }
        ])
        .select();
      
      if (error) throw error;
      
      await refetchUserAdhesionRequests();
      return { success: true, data };
    } catch (err) {
      console.error('Error submitting adhesion request:', err);
      return { success: false, error: 'Impossible de soumettre votre demande d\'adhésion' };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const approveAdhesionRequest = async (requestId: string, notes?: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('sfd_clients')
        .update({
          status: 'approved',
          validated_at: new Date().toISOString(),
          validated_by: user.id,
          notes: notes || null
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      await refetchAdhesionRequests();
      return true;
    } catch (err) {
      console.error('Error approving adhesion request:', err);
      return false;
    }
  };
  
  const rejectAdhesionRequest = async (requestId: string, notes?: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('sfd_clients')
        .update({
          status: 'rejected',
          validated_at: new Date().toISOString(),
          validated_by: user.id,
          notes: notes || null
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      await refetchAdhesionRequests();
      return true;
    } catch (err) {
      console.error('Error rejecting adhesion request:', err);
      return false;
    }
  };

  return {
    userAdhesionRequests,
    isLoadingUserAdhesionRequests,
    error,
    refetchUserAdhesionRequests,
    submitAdhesionRequest,
    isCreatingRequest,
    
    // Adding the missing properties for SFD admin usage
    adhesionRequests,
    isLoadingAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest,
    refetchAdhesionRequests
  };
};
