
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
      
      // Safely convert data.settings to SfdSettings type
      const settingsData = data?.settings as Record<string, any> || {};
      
      // Parse JSON data into our strongly typed interface
      return {
        loan_settings: {
          min_loan_amount: Number(settingsData.loan_settings?.min_loan_amount || 10000),
          max_loan_amount: Number(settingsData.loan_settings?.max_loan_amount || 5000000),
          default_interest_rate: Number(settingsData.loan_settings?.default_interest_rate || 5),
          late_payment_fee: Number(settingsData.loan_settings?.late_payment_fee || 2)
        },
        transaction_settings: {
          daily_withdrawal_limit: Number(settingsData.transaction_settings?.daily_withdrawal_limit || 1000000),
          requires_2fa: Boolean(settingsData.transaction_settings?.requires_2fa ?? true),
          notification_enabled: Boolean(settingsData.transaction_settings?.notification_enabled ?? true)
        },
        security_settings: {
          password_expiry_days: Number(settingsData.security_settings?.password_expiry_days || 90),
          session_timeout_minutes: Number(settingsData.security_settings?.session_timeout_minutes || 30),
          ip_whitelist: Array.isArray(settingsData.security_settings?.ip_whitelist) 
            ? settingsData.security_settings.ip_whitelist 
            : []
        }
      } as SfdSettings;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SfdSettings) => {
      // Convert to a plain object for Supabase
      const settingsForDb = {
        loan_settings: { ...newSettings.loan_settings },
        transaction_settings: { ...newSettings.transaction_settings },
        security_settings: { ...newSettings.security_settings }
      };

      const { data, error } = await supabase
        .from('sfds')
        .update({ settings: settingsForDb })
        .eq('id', sfdId)
        .select('settings')
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
