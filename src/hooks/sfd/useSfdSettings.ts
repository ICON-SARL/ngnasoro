import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SfdSettings {
  loan_settings: {
    min_loan_amount: number;
    max_loan_amount: number;
    default_interest_rate: number;
    late_payment_fee: number;
  };
  transaction_settings: {
    daily_withdrawal_limit: number;
    requires_2fa: boolean;
    notification_enabled: boolean;
  };
  security_settings: {
    password_expiry_days: number;
    session_timeout_minutes: number;
    ip_whitelist: string[];
  };
}

export function useSfdSettings(sfdId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['sfd-settings', sfdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('settings')
        .eq('id', sfdId)
        .single();

      if (error) throw error;
      
      // Parse and validate settings
      const settingsData = data?.settings as Record<string, any> || {};
      return settingsSchema.parse(settingsData) as SfdSettings;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SfdSettings) => {
      // Convert settings to a plain object for storage
      const settingsForDb = {
        loan_settings: { ...newSettings.loan_settings },
        transaction_settings: { ...newSettings.transaction_settings },
        security_settings: { ...newSettings.security_settings }
      };

      const { data, error } = await supabase
        .from('sfds')
        .update({ settings: settingsForDb })
        .eq('id', sfdId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-settings', sfdId] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de la SFD ont été actualisés"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    }
  });

  return {
    settings,
    isLoading,
    updateSettings
  };
}
