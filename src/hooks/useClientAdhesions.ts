
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

export interface ClientAdhesionRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  sfd_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
  user_id?: string;
  [key: string]: any;
}

export function useClientAdhesions() {
  const [adhesionRequests, setAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(true);
  const [isLoadingUserAdhesionRequests, setIsLoadingUserAdhesionRequests] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();

  const refetchAdhesionRequests = async () => {
    if (!user?.id) return;
    
    setIsLoadingAdhesionRequests(true);
    
    try {
      console.log('Fetching adhesion requests for SFD admin');
      
      // Use the Edge Function to get client adhesion requests for this admin
      const { data, error } = await supabase.functions.invoke('fetch-client-adhesions', {
        body: {
          userId: user.id,
          sfdId: activeSfdId
        }
      });
      
      if (error) {
        console.error('Error fetching adhesion requests:', error);
        throw error;
      }
      
      if (!Array.isArray(data)) {
        console.error('Invalid response data format:', data);
        throw new Error('Format de données invalide');
      }
      
      console.log(`Loaded ${data.length} adhesion requests from Edge function`);
      setAdhesionRequests(data);
    } catch (err: any) {
      console.error('Error fetching adhesion requests:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes d\'adhésion',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAdhesionRequests(false);
    }
  };

  const refetchUserAdhesionRequests = async () => {
    if (!user?.id) return;
    
    setIsLoadingUserAdhesionRequests(true);
    
    try {
      console.log('Fetching user adhesion requests');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching user adhesion requests:', error);
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} user adhesion requests`);
      setUserAdhesionRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching user adhesion requests:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos demandes d\'adhésion',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUserAdhesionRequests(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refetchAdhesionRequests();
      refetchUserAdhesionRequests();
    }
  }, [user?.id, activeSfdId]);

  const processAdhesionRequest = async (
    requestId: string, 
    status: 'approved' | 'rejected', 
    notes?: string
  ) => {
    if (!user?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour traiter une demande',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status,
          notes,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) {
        console.error('Error processing adhesion request:', error);
        throw error;
      }
      
      toast({
        title: status === 'approved' ? 'Demande approuvée' : 'Demande rejetée',
        description: status === 'approved' 
          ? 'La demande d\'adhésion a été approuvée avec succès' 
          : 'La demande d\'adhésion a été rejetée',
      });
      
      // Refresh the list
      refetchAdhesionRequests();
      
      return true;
    } catch (err: any) {
      console.error('Error processing adhesion request:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter la demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    userAdhesionRequests,
    isLoadingUserAdhesionRequests,
    refetchAdhesionRequests,
    refetchUserAdhesionRequests,
    processAdhesionRequest,
  };
}
