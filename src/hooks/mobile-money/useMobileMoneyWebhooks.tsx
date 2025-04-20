import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MobileMoneyWebhook } from '@/types/sfdClients';

export function useMobileMoneyWebhooks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Récupérer tous les webhooks du mobile money
  const fetchMobileMoneyWebhooks = async (): Promise<MobileMoneyWebhook[]> => {
    const { data, error } = await supabase
      .from('mobile_money_webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mobile money webhooks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les transactions mobile money",
        variant: "destructive",
      });
      return [];
    }

    return data as MobileMoneyWebhook[];
  };

  // Marquer un webhook comme traité
  const markWebhookAsProcessed = useMutation({
    mutationFn: async ({ webhookId, accountId }: { webhookId: string; accountId: string }) => {
      const { data, error } = await supabase
        .from('mobile_money_webhooks')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          account_id: accountId
        })
        .eq('id', webhookId)
        .select()
        .single();

      if (error) throw error;

      // Créer une transaction pour mettre à jour le solde du compte
      const webhook = data as MobileMoneyWebhook;
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: webhook.user_id,
          amount: webhook.amount,
          type: 'deposit',
          name: `Dépôt ${webhook.provider}`,
          description: `Transaction ${webhook.reference_id}`,
          payment_method: webhook.provider,
          reference_id: webhook.reference_id,
          status: 'success'
        });

      if (transactionError) throw transactionError;

      return data as MobileMoneyWebhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-webhooks'] });
      toast({
        title: "Transaction traitée",
        description: "La transaction mobile money a été traitée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de traiter la transaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Marquer un webhook comme échoué
  const markWebhookAsFailed = useMutation({
    mutationFn: async ({ webhookId, reason }: { webhookId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('mobile_money_webhooks')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          raw_payload: { failure_reason: reason }
        })
        .eq('id', webhookId)
        .select()
        .single();

      if (error) throw error;
      return data as MobileMoneyWebhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-webhooks'] });
      toast({
        title: "Transaction rejetée",
        description: "La transaction mobile money a été marquée comme échouée",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de rejeter la transaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Requête pour les webhooks
  const mobileMoneyWebhooksQuery = useQuery({
    queryKey: ['mobile-money-webhooks'],
    queryFn: fetchMobileMoneyWebhooks,
  });

  return {
    // Données
    mobileMoneyWebhooks: mobileMoneyWebhooksQuery.data || [],
    
    // État des requêtes
    isLoadingWebhooks: mobileMoneyWebhooksQuery.isLoading,
    
    // Mutations
    markWebhookAsProcessed,
    markWebhookAsFailed,
    
    // Rechargement manuel
    refetchWebhooks: () => queryClient.invalidateQueries({ queryKey: ['mobile-money-webhooks'] }),
  };
}
