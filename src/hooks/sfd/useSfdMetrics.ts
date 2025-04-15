
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
      
      // Safely convert data.metrics to SfdMetrics type
      const metricsData = data?.metrics as Record<string, any>;
      if (!metricsData) {
        throw new Error("Metrics data not found");
      }
      
      // Parse JSON data into our strongly typed interface
      return {
        loan_metrics: {
          total_loans: Number(metricsData.loan_metrics?.total_loans || 0),
          active_loans: Number(metricsData.loan_metrics?.active_loans || 0),
          default_rate: Number(metricsData.loan_metrics?.default_rate || 0),
          average_loan_amount: Number(metricsData.loan_metrics?.average_loan_amount || 0)
        },
        client_metrics: {
          total_clients: Number(metricsData.client_metrics?.total_clients || 0),
          active_clients: Number(metricsData.client_metrics?.active_clients || 0),
          new_clients: Number(metricsData.client_metrics?.new_clients || 0)
        },
        financial_metrics: {
          total_deposits: Number(metricsData.financial_metrics?.total_deposits || 0),
          total_withdrawals: Number(metricsData.financial_metrics?.total_withdrawals || 0),
          net_portfolio: Number(metricsData.financial_metrics?.net_portfolio || 0)
        },
        operational_metrics: {
          transaction_success_rate: Number(metricsData.operational_metrics?.transaction_success_rate || 100),
          average_processing_time: Number(metricsData.operational_metrics?.average_processing_time || 0),
          support_tickets: Number(metricsData.operational_metrics?.support_tickets || 0)
        }
      } as SfdMetrics;
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
