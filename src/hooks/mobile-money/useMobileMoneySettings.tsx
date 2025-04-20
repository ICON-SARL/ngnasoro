
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MobileMoneySettings } from '@/types/sfdClients';

export function useMobileMoneySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les paramètres du mobile money pour un utilisateur
  const fetchMobileMoneySettings = async (): Promise<MobileMoneySettings[]> => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from('mobile_money_settings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mobile money settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos paramètres mobile money",
        variant: "destructive",
      });
      return [];
    }

    return data as MobileMoneySettings[];
  };

  // Mettre à jour les paramètres du mobile money
  const updateMobileMoneySettings = useMutation({
    mutationFn: async (settings: Partial<MobileMoneySettings> & { id: string }) => {
      const { data, error } = await supabase
        .from('mobile_money_settings')
        .update(settings)
        .eq('id', settings.id)
        .select();

      if (error) {
        console.error('Error updating mobile money settings:', error);
        throw new Error("Impossible de mettre à jour les paramètres mobile money");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-settings', user?.id] });
      toast({
        title: "Succès",
        description: "Paramètres mobile money mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour des paramètres",
        variant: "destructive",
      });
    },
  });

  // Requête
  const mobileMoneySettingsQuery = useQuery({
    queryKey: ['mobile-money-settings', user?.id],
    queryFn: fetchMobileMoneySettings,
    enabled: !!user?.id,
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
