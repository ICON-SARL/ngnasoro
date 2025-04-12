
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MobileMoneyWebhook } from '@/types/adhesionTypes';

export function useUserMobileMoneyWebhooks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Requête
  const userMobileMoneyWebhooksQuery = useQuery({
    queryKey: ['user-mobile-money-webhooks', user?.id],
    queryFn: fetchUserMobileMoneyWebhooks,
    enabled: !!user?.id,
  });

  return {
    // Données
    userMobileMoneyWebhooks: userMobileMoneyWebhooksQuery.data || [],
    
    // État des requêtes
    isLoadingUserWebhooks: userMobileMoneyWebhooksQuery.isLoading,
    
    // Rechargement manuel
    refetchUserWebhooks: () => queryClient.invalidateQueries({ queryKey: ['user-mobile-money-webhooks'] }),
  };
}
