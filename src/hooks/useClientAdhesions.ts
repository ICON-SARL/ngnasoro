
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AdhesionRequest {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  sfd_id: string;
  sfd_name?: string;
  user_id: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adhesionRequests, setAdhesionRequests] = useState<AdhesionRequest[]>([]);
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<AdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(true);
  
  const fetchAdhesionRequests = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingAdhesionRequests(true);
    try {
      console.log('Fetching adhesion requests...');
      
      // Utilisez la fonction Edge pour récupérer les données
      const { data, error } = await supabase.functions.invoke('fetch-client-adhesions', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Error fetching adhesion requests:', error);
        throw error;
      }
      
      console.log('Adhesion requests received:', data);
      setAdhesionRequests(data || []);
    } catch (error) {
      console.error('Error fetching adhesion requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les demandes d\'adhésion',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAdhesionRequests(false);
    }
  }, [user, toast]);
  
  const fetchUserAdhesionRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Fetching user adhesion requests...');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*, sfds:sfd_id(name)')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user adhesion requests:', error);
        throw error;
      }
      
      console.log(`Found ${data.length} user adhesion requests`);
      
      const formattedRequests = data.map(req => ({
        ...req,
        sfd_name: req.sfds?.name,
        status: req.status as 'pending' | 'approved' | 'rejected' // Type assertion to fix type error
      }));
      
      setUserAdhesionRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching user adhesion requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer vos demandes d\'adhésion',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAdhesionRequests();
    fetchUserAdhesionRequests();
  }, [fetchAdhesionRequests, fetchUserAdhesionRequests]);

  return {
    adhesionRequests,
    userAdhesionRequests,
    isLoadingAdhesionRequests,
    refetchAdhesionRequests: fetchAdhesionRequests,
    refetchUserAdhesionRequests: fetchUserAdhesionRequests
  };
}
