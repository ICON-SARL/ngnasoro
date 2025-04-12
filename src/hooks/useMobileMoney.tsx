
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MobileMoneyWebhook, MobileMoneySettings } from '@/types/adhesionTypes';

export function useMobileMoney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Récupérer les webhooks du mobile money pour un utilisateur
  const fetchUserMobileMoneyWebhooks = async (): Promise<MobileMoneyWebhook[]> => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from('mobile_money_webhooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user mobile money webhooks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos transactions mobile money",
        variant: "destructive",
      });
      return [];
    }

    return data as MobileMoneyWebhook[];
  };

  // Récupérer les paramètres du mobile money
  const fetchMobileMoneySettings = async (): Promise<MobileMoneySettings[]> => {
    const { data, error } = await supabase
      .from('mobile_money_settings')
      .select('*');

    if (error) {
      console.error('Error fetching mobile money settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les paramètres mobile money",
        variant: "destructive",
      });
      return [];
    }

    return data as MobileMoneySettings[];
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
          raw_payload: supabase.rpc('jsonb_set', { 
            target: supabase.raw('COALESCE(raw_payload, \'{}\')::jsonb'), 
            path: '{failure_reason}', 
            value: JSON.stringify(reason)
          })
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

  // Mettre à jour les paramètres du mobile money
  const updateMobileMoneySettings = useMutation({
    mutationFn: async (settings: {
      id: string;
      webhook_secret?: string;
      api_key?: string;
      api_url?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('mobile_money_settings')
        .update({
          webhook_secret: settings.webhook_secret,
          api_key: settings.api_key,
          api_url: settings.api_url,
          is_active: settings.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data as MobileMoneySettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-settings'] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres mobile money ont été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les paramètres: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Requêtes
  const mobileMoneyWebhooksQuery = useQuery({
    queryKey: ['mobile-money-webhooks'],
    queryFn: fetchMobileMoneyWebhooks,
  });

  const userMobileMoneyWebhooksQuery = useQuery({
    queryKey: ['user-mobile-money-webhooks', user?.id],
    queryFn: fetchUserMobileMoneyWebhooks,
    enabled: !!user?.id,
  });

  const mobileMoneySettingsQuery = useQuery({
    queryKey: ['mobile-money-settings'],
    queryFn: fetchMobileMoneySettings,
  });

  return {
    // Données
    mobileMoneyWebhooks: mobileMoneyWebhooksQuery.data || [],
    userMobileMoneyWebhooks: userMobileMoneyWebhooksQuery.data || [],
    mobileMoneySettings: mobileMoneySettingsQuery.data || [],
    
    // État des requêtes
    isLoadingWebhooks: mobileMoneyWebhooksQuery.isLoading,
    isLoadingUserWebhooks: userMobileMoneyWebhooksQuery.isLoading,
    isLoadingSettings: mobileMoneySettingsQuery.isLoading,
    
    // Mutations
    markWebhookAsProcessed,
    markWebhookAsFailed,
    updateMobileMoneySettings,
    
    // Rechargement manuel
    refetchWebhooks: () => queryClient.invalidateQueries({ queryKey: ['mobile-money-webhooks'] }),
    refetchUserWebhooks: () => queryClient.invalidateQueries({ queryKey: ['user-mobile-money-webhooks'] }),
    refetchSettings: () => queryClient.invalidateQueries({ queryKey: ['mobile-money-settings'] }),
  };
}
