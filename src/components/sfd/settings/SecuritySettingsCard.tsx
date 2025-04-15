
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { SettingsFormValues } from './types';

interface SecuritySettingsCardProps {
  control: Control<SettingsFormValues>;
}

export function SecuritySettingsCard({ control }: SecuritySettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de sécurité</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField
          control={control}
          name="security_settings.password_expiry_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration du mot de passe (jours)</FormLabel>
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
          name="security_settings.session_timeout_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Délai d'expiration de session (minutes)</FormLabel>
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
      </CardContent>
    </Card>
  );
}
