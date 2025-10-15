
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SfdMetrics {
  loan_metrics: {
    total_loans: number;
    active_loans: number;
    default_rate: number;
    average_loan_amount: number;
  };
  client_metrics: {
    total_clients: number;
    active_clients: number;
    new_clients: number;
  };
  financial_metrics: {
    total_deposits: number;
    total_withdrawals: number;
    net_portfolio: number;
  };
  operational_metrics: {
    transaction_success_rate: number;
    average_processing_time: number;
    support_tickets: number;
  };
}

export function useSfdMetrics(sfdId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['sfd-metrics', sfdId],
    queryFn: async () => {
      // Return calculated metrics from existing tables
      const { data: stats } = await supabase
        .from('sfd_stats')
        .select('*')
        .eq('sfd_id', sfdId)
        .maybeSingle();

      const { data: clients } = await supabase
        .from('sfd_clients')
        .select('id, status')
        .eq('sfd_id', sfdId);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('sfd_id', sfdId);

      const totalDeposits = transactions?.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalWithdrawals = transactions?.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        loan_metrics: {
          total_loans: stats?.total_loans || 0,
          active_loans: stats?.active_loans || 0,
          default_rate: stats?.defaulted_loans || 0,
          average_loan_amount: stats?.total_loans ? (stats.total_disbursed / stats.total_loans) : 0
        },
        client_metrics: {
          total_clients: clients?.length || 0,
          active_clients: clients?.filter(c => c.status === 'active').length || 0,
          new_clients: 0
        },
        financial_metrics: {
          total_deposits: totalDeposits,
          total_withdrawals: totalWithdrawals,
          net_portfolio: stats?.total_disbursed || 0
        },
        operational_metrics: {
          transaction_success_rate: 100,
          average_processing_time: 0,
          support_tickets: 0
        }
      } as SfdMetrics;
    }
  });

  const updateMetrics = useMutation({
    mutationFn: async () => {
      // Simply refetch the metrics
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-metrics', sfdId] });
      toast({
        title: "Métriques mises à jour",
        description: "Les métriques de performance ont été actualisées"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les métriques",
        variant: "destructive"
      });
    }
  });

  return {
    metrics,
    isLoading,
    updateMetrics
  };
}
