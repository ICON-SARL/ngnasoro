import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AdhesionRequest {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string | null;
  processed_by?: string | null;
  notes?: string | null;
  sfd_id: string;
  sfd_name?: string;
  user_id: string;
  // Adding missing properties
  reference_number?: string | null;
  profession?: string | null;
  monthly_income?: number | null;
  source_of_income?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  kyc_status?: string | null;
  verification_stage?: string | null;
  rejection_reason?: string | null;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface AdhesionRequestInput {
  full_name: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adhesionRequests, setAdhesionRequests] = useState<AdhesionRequest[]>([]);
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<AdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(true);
  const [isLoadingUserAdhesionRequests, setIsLoadingUserAdhesionRequests] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchAdhesionRequests = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingAdhesionRequests(true);
    try {
      console.log('Fetching adhesion requests...');
      
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
    
    setIsLoadingUserAdhesionRequests(true);
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
        status: req.status as 'pending' | 'approved' | 'rejected'
      }));
      
      setUserAdhesionRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching user adhesion requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer vos demandes d\'adhésion',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUserAdhesionRequests(false);
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
    isLoadingUserAdhesionRequests,
    refetchAdhesionRequests: fetchAdhesionRequests,
    refetchUserAdhesionRequests: fetchUserAdhesionRequests,
    retryCount
  };
}
