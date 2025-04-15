
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
      const { data, error } = await supabase
        .from('sfd_performance_metrics')
        .select('metrics')
        .eq('sfd_id', sfdId)
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single();

      if (error) throw error;
      return data?.metrics as SfdMetrics;
    }
  });

  const updateMetrics = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('update_sfd_metrics', {
        p_sfd_id: sfdId
      });

      if (error) throw error;
      return data;
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
