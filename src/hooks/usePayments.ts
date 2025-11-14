import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function usePayments() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      const { data, error } = await supabase
        .from('loan_payments')
        .select(`
          *,
          loan:sfd_loans!loan_id(
            *,
            client:sfd_clients!client_id(*)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
  });

  const makePayment = useMutation({
    mutationFn: async (paymentData: any) => {
      const { data, error } = await supabase.functions.invoke('make-payment', {
        body: paymentData,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Succès',
        description: 'Paiement enregistré avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    payments,
    isLoading,
    makePayment,
  };
}
