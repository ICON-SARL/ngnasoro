
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SfdFormValues } from '../schemas/sfdFormSchema';
import { CircleDollarSign } from 'lucide-react';

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
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="number" 
                className="pl-9 focus:border-[#0D6A51] focus:ring-[#0D6A51]/20"
                placeholder="0" 
                {...field} 
                value={field.value === undefined || field.value === null ? '' : field.value}
                onChange={(e) => {
                  // Handle empty string to return undefined instead of 0
                  const value = e.target.value === '' ? undefined : 
                                Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                  field.onChange(value);
                }}
                onBlur={() => {
                  // Make sure we don't have NaN values on blur
                  if (field.value === undefined || field.value === null || Number.isNaN(field.value)) {
                    field.onChange(0);
                  }
                }}
                disabled={form.formState.isSubmitting}
              />
            </div>
          </FormControl>
          <FormDescription className="text-sm text-blue-600">
            Ce montant sera utilisé pour créer une subvention initiale pour cette SFD.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
