
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSfdSettings, SfdSettings } from '@/hooks/sfd/useSfdSettings';

const settingsSchema = z.object({
  loan_settings: z.object({
    min_loan_amount: z.number().min(0),
    max_loan_amount: z.number().min(0),
    default_interest_rate: z.number().min(0),
    late_payment_fee: z.number().min(0)
  }),
  transaction_settings: z.object({
    daily_withdrawal_limit: z.number().min(0),
    requires_2fa: z.boolean(),
    notification_enabled: z.boolean()
  }),
  security_settings: z.object({
    password_expiry_days: z.number().min(0),
    session_timeout_minutes: z.number().min(0)
  })
});

interface SfdSettingsFormProps {
  sfdId: string;
}

export function SfdSettingsForm({ sfdId }: SfdSettingsFormProps) {
  const { settings, isLoading, updateSettings } = useSfdSettings(sfdId);
  
  const form = useForm<SfdSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
  });

  const onSubmit = async (data: SfdSettings) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres des prêts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="loan_settings.min_loan_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant minimum du prêt (FCFA)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loan_settings.max_loan_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant maximum du prêt (FCFA)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loan_settings.default_interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taux d'intérêt par défaut (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de transaction</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="transaction_settings.daily_withdrawal_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite quotidienne de retrait (FCFA)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transaction_settings.requires_2fa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Authentification à deux facteurs</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
