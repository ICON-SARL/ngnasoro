
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

export type ClientAdhesionRequest = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  profession?: string;
  monthly_income?: number;
  source_of_income?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  kyc_status?: string;
  sfd_id: string;
};

export function useClientAdhesions() {
  const [adhesionRequests, setAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();

  const fetchAdhesionRequests = async () => {
    if (!activeSfdId) return;
    
    try {
      setIsLoadingAdhesionRequests(true);
      const { data: requests, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdhesionRequests(requests || []);
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
  };

  const approveAdhesionRequest = async (requestId: string, notes?: string) => {
    if (!user) return false;
    
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

      fetchAdhesionRequests();
      return true;
    } catch (error) {
      console.error('Error approving adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectAdhesionRequest = async (requestId: string, notes?: string) => {
    if (!user) return false;
    
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

      fetchAdhesionRequests();
      return true;
    } catch (error) {
      console.error('Error rejecting adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (activeSfdId) {
      fetchAdhesionRequests();
    }
  }, [activeSfdId]);

  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest,
    refetchAdhesionRequests: fetchAdhesionRequests
  };
}
