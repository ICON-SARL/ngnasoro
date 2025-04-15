
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSfdSettings } from '@/hooks/sfd/useSfdSettings';
import { LoanSettingsCard } from './settings/LoanSettingsCard';
import { TransactionSettingsCard } from './settings/TransactionSettingsCard';
import { SecuritySettingsCard } from './settings/SecuritySettingsCard';
import { settingsSchema, SettingsFormValues } from './settings/types';
import { SfdSettings } from '@/hooks/sfd/useSfdSettings';

interface SfdSettingsFormProps {
  sfdId: string;
}

export function SfdSettingsForm({ sfdId }: SfdSettingsFormProps) {
  const { settings, isLoading, updateSettings } = useSfdSettings(sfdId);
  
  const defaultValues: SettingsFormValues = {
    loan_settings: {
      min_loan_amount: 10000,
      max_loan_amount: 5000000,
      default_interest_rate: 5,
      late_payment_fee: 2
    },
    transaction_settings: {
      daily_withdrawal_limit: 1000000,
      requires_2fa: true,
      notification_enabled: true
    },
    security_settings: {
      password_expiry_days: 90,
      session_timeout_minutes: 30,
      ip_whitelist: []
    }
  };
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || defaultValues
  });

  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    updateSettings.mutate(data as SfdSettings);
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LoanSettingsCard control={form.control} />
        <TransactionSettingsCard control={form.control} />
        <SecuritySettingsCard control={form.control} />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Enregistrer les modifications
        </Button>
      </form>
    </Form>
  );
}
