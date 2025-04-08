
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SfdFormValues } from '../schemas/sfdFormSchema';

interface SfdContactFieldsProps {
  form: UseFormReturn<SfdFormValues>;
}

export function SfdContactFields({ form }: SfdContactFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Téléphone */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Téléphone</FormLabel>
            <FormControl>
              <Input placeholder="+223 XX XXX XXXX" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
