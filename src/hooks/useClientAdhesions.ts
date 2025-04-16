import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export interface AdhesionRequestInput {
  full_name: string;
  profession: string;
  monthly_income: string;
  source_of_income: string;
  phone: string;
  email: string;
  address: string;
}

export function useClientAdhesions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  
  const [adhesionRequests, setAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(true);
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingUserAdhesionRequests, setIsLoadingUserAdhesionRequests] = useState(true);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  
  const fetchAdhesionRequests = useCallback(async () => {
    if (!user?.id || !activeSfdId) return;
    
    setIsLoadingAdhesionRequests(true);
    
    try {
      console.log(`Fetching adhesion requests for SFD: ${activeSfdId}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-client-adhesions', {
        body: { userId: user.id, sfdId: activeSfdId }
      });
      
      if (error) {
        console.error('Error fetching adhesion requests from Edge Function:', error);
        
        console.log('Attempting direct DB fetch as fallback...');
        const { data: directData, error: directError } = await supabase
          .from('client_adhesion_requests')
          .select(`
            *,
            sfds:sfd_id(name)
          `)
          .eq('sfd_id', activeSfdId)
          .order('created_at', { ascending: false });
          
        if (directError) {
          throw directError;
        }
        
        const formattedRequests = directData?.map(req => ({
          ...req,
          sfd_name: req.sfds?.name
        })) || [];
        
        console.log(`Fallback: Found ${formattedRequests.length} adhesion requests`);
        setAdhesionRequests(formattedRequests as ClientAdhesionRequest[]);
      } else {
        console.log(`Success: Found ${data?.length || 0} adhesion requests`);
        console.log('Adhesion requests data:', data);
        setAdhesionRequests(data as ClientAdhesionRequest[]);
      }
    } catch (error) {
      console.error('Error in useClientAdhesions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes d\'adhésion',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAdhesionRequests(false);
    }
  }, [user?.id, activeSfdId, toast]);
  
  const fetchUserAdhesionRequests = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingUserAdhesionRequests(true);
    
    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select(`*, sfds:sfd_id(name)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedRequests = data?.map(req => ({
        ...req,
        sfd_name: req.sfds?.name
      })) || [];
      
      console.log(`Found ${formattedRequests.length} user adhesion requests`);
      setUserAdhesionRequests(formattedRequests as ClientAdhesionRequest[]);
    } catch (error) {
      console.error('Error fetching user adhesion requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos demandes d\'adhésion',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingUserAdhesionRequests(false);
    }
  }, [user?.id, toast]);
  
  const refetchAdhesionRequests = useCallback(async () => {
    await fetchAdhesionRequests();
  }, [fetchAdhesionRequests]);
  
  const refetchUserAdhesionRequests = useCallback(async () => {
    await fetchUserAdhesionRequests();
  }, [fetchUserAdhesionRequests]);
  
  useEffect(() => {
    fetchAdhesionRequests();
  }, [fetchAdhesionRequests]);
  
  useEffect(() => {
    fetchUserAdhesionRequests();
  }, [fetchUserAdhesionRequests]);
  
  const approveAdhesionRequest = useCallback(async (requestId: string, notes?: string) => {
    if (!user?.id) return false;
    
    try {
      console.log(`Approving adhesion request: ${requestId} with notes: ${notes || 'none'}`);
      
      const { error: updateError } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', requestId);
      
      if (updateError) {
        console.error('Error updating adhesion request:', updateError);
        throw updateError;
      }
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande d\'adhésion a été approuvée avec succès',
      });
      
      await fetchAdhesionRequests();
      return true;
    } catch (error) {
      console.error('Error approving adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande d\'adhésion',
        variant: 'destructive'
      });
      return false;
    }
  }, [user?.id, toast, fetchAdhesionRequests]);
  
  const rejectAdhesionRequest = useCallback(async (requestId: string, notes?: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Demande rejetée',
        description: 'La demande d\'adhésion a été rejetée',
      });
      
      await fetchAdhesionRequests();
      return true;
    } catch (error) {
      console.error('Error rejecting adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande d\'adhésion',
        variant: 'destructive'
      });
      return false;
    }
  }, [user?.id, toast, fetchAdhesionRequests]);
  
  const submitAdhesionRequest = useCallback(async (sfdId: string, input: AdhesionRequestInput) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      setIsCreatingRequest(true);

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: input.full_name,
          profession: input.profession,
          monthly_income: parseFloat(input.monthly_income),
          source_of_income: input.source_of_income,
          phone: input.phone,
          email: input.email,
          address: input.address,
          status: 'pending',
          kyc_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès"
      });
      
      await fetchUserAdhesionRequests();
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande',
        variant: "destructive"
      });
      
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande' 
      };
    } finally {
      setIsCreatingRequest(false);
    }
  }, [user, toast, fetchUserAdhesionRequests]);
  
  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    userAdhesionRequests,
    isLoadingUserAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest,
    submitAdhesionRequest,
    isCreatingRequest,
    refetchAdhesionRequests,
    refetchUserAdhesionRequests
  };
}
