
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileMoneySettings } from '@/types/adhesionTypes';

export function useMobileMoneySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Requête
  const mobileMoneySettingsQuery = useQuery({
    queryKey: ['mobile-money-settings'],
    queryFn: fetchMobileMoneySettings,
  });

  return {
    // Données
    mobileMoneySettings: mobileMoneySettingsQuery.data || [],
    
    // État des requêtes
    isLoadingSettings: mobileMoneySettingsQuery.isLoading,
    
    // Mutations
    updateMobileMoneySettings,
    
    // Rechargement manuel
    refetchSettings: () => queryClient.invalidateQueries({ queryKey: ['mobile-money-settings'] }),
  };
}
