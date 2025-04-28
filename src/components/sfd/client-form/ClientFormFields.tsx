
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { ClientFormData } from './types';
import PhoneNumberInput from '@/components/mobile/profile/sfd-accounts/PhoneNumberInput';

export function ClientFormFields() {
  const form = useFormContext<ClientFormData>();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="full_name">Nom complet *</Label>
        <Input
          id="full_name"
          placeholder="Nom complet du client"
          {...form.register('full_name')}
          className={form.formState.errors.full_name ? 'border-red-500' : ''}
        />
        {form.formState.errors.full_name && (
          <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email du client"
            {...form.register('email')}
            className={form.formState.errors.email ? 'border-red-500' : ''}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <PhoneNumberInput
            value={form.watch('phone') || ''}
            onChange={(e) => form.setValue('phone', e.target.value, { shouldValidate: true })}
            onValidationChange={(isValid) => {
              if (!isValid && form.getValues('phone')) {
                form.setError('phone', { 
                  message: 'Le numéro doit être au format malien (+223 6X/7X XX XX XX)' 
                });
              } else {
                form.clearErrors('phone');
              }
            }}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          placeholder="Adresse du client"
          {...form.register('address')}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id_type">Type de pièce d'identité</Label>
          <Input
            id="id_type"
            placeholder="CNI, Passeport, etc."
            {...form.register('id_type')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
          <Input
            id="id_number"
            placeholder="Numéro de la pièce"
            {...form.register('id_number')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Notes additionnelles"
          {...form.register('notes')}
        />
      </div>
    </>
  );
}
