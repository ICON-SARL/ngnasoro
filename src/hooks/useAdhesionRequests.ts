
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

export function useAdhesionRequests() {
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();

  const fetchRequests = async () => {
    if (!activeSfdId) return [];

    const { data, error } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('sfd_id', activeSfdId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching adhesion requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les demandes d\'adhésion',
        variant: 'destructive',
      });
      return [];
    }

    return data;
  };

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['adhesion-requests', activeSfdId],
    queryFn: fetchRequests,
    enabled: !!activeSfdId,
  });

  return {
    requests: data,
    isLoading,
    fetchRequests: refetch,
  };
}
