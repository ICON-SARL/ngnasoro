
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SfdFormValues } from '../schemas/sfdFormSchema';

interface SfdFinanceFieldsProps {
  form: UseFormReturn<SfdFormValues>;
}

export function SfdFinanceFields({ form }: SfdFinanceFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="subsidy_balance"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Solde de Subvention (FCFA)</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder="0" 
              {...field} 
              onChange={(e) => field.onChange(Number(e.target.value))}
              disabled={form.formState.isSubmitting}
            />
          </FormControl>
          <FormDescription>
            Ce montant sera utilisé pour créer une subvention initiale pour cette SFD.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
