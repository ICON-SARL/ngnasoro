
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { SettingsFormValues } from './types';

interface LoanSettingsCardProps {
  control: Control<SettingsFormValues>;
}

export function LoanSettingsCard({ control }: LoanSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres des prêts</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField
          control={control}
          name="loan_settings.min_loan_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant minimum du prêt (FCFA)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="loan_settings.max_loan_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant maximum du prêt (FCFA)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="loan_settings.default_interest_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taux d'intérêt par défaut (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="loan_settings.late_payment_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frais de retard de paiement (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
