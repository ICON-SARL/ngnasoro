
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SfdFormValues } from '../schemas/sfdFormSchema';
import { normalizeMaliPhoneNumber, validateMaliPhoneNumber } from '@/lib/constants';

interface SfdContactFieldsProps {
  form: UseFormReturn<SfdFormValues>;
}

export function SfdContactFields({ form }: SfdContactFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contact_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email de contact</FormLabel>
            <FormControl>
              <Input type="email" placeholder="email@sfd.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phone"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Téléphone</FormLabel>
            <FormControl>
              <Input
                placeholder="+223 XX XXX XX XX"
                {...field}
                onChange={(e) => {
                  const normalized = normalizeMaliPhoneNumber(e.target.value);
                  onChange(normalized);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
