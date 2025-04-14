
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSfdLoans() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['sfd-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) {
        throw new Error('Failed to fetch client data');
      }

      if (!clientsData?.length) {
        return [];
      }

      const clientIds = clientsData.map(client => client.id);

      const { data: loans, error: loansError } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          sfds:sfd_id (
            name,
            logo_url
          )
        `)
        .in('client_id', clientIds)
        .order('created_at', { ascending: false });

      if (loansError) {
        throw loansError;
      }

      return loans || [];
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos prêts",
        variant: "destructive",
      });
    }
  });
}
