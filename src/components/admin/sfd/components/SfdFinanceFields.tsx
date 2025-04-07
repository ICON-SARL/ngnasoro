
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
