import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useLoans() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          client:sfd_clients!client_id(*),
          plan:sfd_loan_plans!loan_plan_id(*)
        `)
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
  });

  const { data: loanPlans } = useQuery({
    queryKey: ['loan-plans', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
  });

  const applyForLoan = useMutation({
    mutationFn: async (loanData: any) => {
      const { data, error } = await supabase.functions.invoke('apply-for-loan', {
        body: loanData,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Succès',
        description: 'Demande de prêt soumise avec succès',
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

  const approveLoan = useMutation({
    mutationFn: async ({ loanId, approved }: { loanId: string; approved: boolean }) => {
      const { data, error } = await supabase.functions.invoke('approve-loan', {
        body: { loanId, approved },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Succès',
        description: 'Prêt traité avec succès',
      });
    },
  });

  const disburseLoan = useMutation({
    mutationFn: async (loanId: string) => {
      const { data, error } = await supabase.functions.invoke('disburse-loan', {
        body: { loanId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Succès',
        description: 'Prêt décaissé avec succès',
      });
    },
  });

  return {
    loans,
    loanPlans,
    isLoading,
    applyForLoan,
    approveLoan,
    disburseLoan,
  };
}
