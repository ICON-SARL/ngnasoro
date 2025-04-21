
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the type without importing it to prevent circular dependency
interface MobileMoneySettings {
  id: string;
  provider: string;
  api_key?: string;
  api_url?: string;
  webhook_secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export function useMobileMoneySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingSettings, setIsCreatingSettings] = useState(false);

  // Fetch settings query
  const {
    data: mobileMoneySettings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['mobile-money-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('mobile_money_settings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as MobileMoneySettings[];
      } catch (err) {
        console.error('Error fetching mobile money settings:', err);
        return [];
      }
    }
  });

  // Create settings mutation
  const createSettings = useMutation({
    mutationFn: async (settings: Omit<MobileMoneySettings, 'id' | 'created_at' | 'updated_at'>) => {
      setIsCreatingSettings(true);
      try {
        const { data, error } = await supabase
          .from('mobile_money_settings')
          .insert({
            provider: settings.provider,
            api_key: settings.api_key,
            api_url: settings.api_url,
            webhook_secret: settings.webhook_secret,
            is_active: settings.is_active
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsCreatingSettings(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-settings'] });
      toast({
        title: "Paramètres ajoutés",
        description: "Les paramètres de mobile money ont été ajoutés avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer les paramètres: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async ({ 
      id, 
      settings 
    }: { 
      id: string; 
      settings: Partial<MobileMoneySettings>; 
    }) => {
      try {
        const { data, error } = await supabase
          .from('mobile_money_settings')
          .update({
            provider: settings.provider,
            api_key: settings.api_key,
            api_url: settings.api_url,
            webhook_secret: settings.webhook_secret,
            is_active: settings.is_active
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-settings'] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de mobile money ont été mis à jour",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les paramètres: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Toggle active status mutation
  const toggleActiveStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      try {
        const { data, error } = await supabase
          .from('mobile_money_settings')
          .update({ is_active: isActive })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-settings'] });
      toast({
        title: variables.isActive ? "Activé" : "Désactivé",
        description: `Les paramètres de mobile money ont été ${variables.isActive ? "activés" : "désactivés"}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de modifier le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    mobileMoneySettings,
    isLoadingSettings,
    settingsError,
    isCreatingSettings,
    refetchSettings,
    createSettings,
    updateSettings,
    toggleActiveStatus
  };
}
