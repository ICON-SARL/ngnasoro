
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export function useClientAdhesions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  
  const [adhesionRequests, setAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(true);
  
  const fetchAdhesionRequests = useCallback(async () => {
    if (!user?.id || !activeSfdId) return;
    
    setIsLoadingAdhesionRequests(true);
    
    try {
      console.log(`Fetching adhesion requests for SFD: ${activeSfdId}`);
      
      // Appel à l'Edge Function via la méthode invoke
      const { data, error } = await supabase.functions.invoke('fetch-client-adhesions', {
        body: { userId: user.id, sfdId: activeSfdId }
      });
      
      if (error) {
        console.error('Error fetching adhesion requests from Edge Function:', error);
        
        // Fallback: récupération directe depuis la base de données
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
        
        // Format the data to include sfd name
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
  
  // Fonction pour refetch les demandes d'adhésion (utilisé par le bouton Refresh)
  const refetchAdhesionRequests = useCallback(async () => {
    await fetchAdhesionRequests();
  }, [fetchAdhesionRequests]);
  
  // Chargement initial des demandes
  useEffect(() => {
    fetchAdhesionRequests();
  }, [fetchAdhesionRequests]);
  
  // Approuver une demande d'adhésion
  const approveAdhesionRequest = useCallback(async (requestId: string, notes?: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande d\'adhésion a été approuvée avec succès',
      });
      
      // Refresh list
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
  
  // Rejeter une demande d'adhésion
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
      
      // Refresh list
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
  
  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest,
    refetchAdhesionRequests
  };
}
