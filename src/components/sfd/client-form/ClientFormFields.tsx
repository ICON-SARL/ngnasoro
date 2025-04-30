
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { ClientFormData } from './types';
import PhoneNumberInput from '@/components/mobile/profile/sfd-accounts/PhoneNumberInput';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import { AlertCircle } from 'lucide-react';

export function ClientFormFields() {
  const form = useFormContext<ClientFormData>();
  const { checkClientExists } = useSfdClientManagement();
  const [emailExists, setEmailExists] = useState(false);
  const [existingClientInfo, setExistingClientInfo] = useState<any>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Email validation with debounce
  useEffect(() => {
    const email = form.watch('email');
    const emailTimeout = setTimeout(async () => {
      if (email && email.trim() !== '') {
        setCheckingEmail(true);
        try {
          const result = await checkClientExists(email);
          if (result && typeof result === 'object' && 'exists' in result) {
            setEmailExists(result.exists);
            if (result.exists) {
              setExistingClientInfo({
                full_name: result.full_name,
                status: result.status
              });
            } else {
              setExistingClientInfo(null);
            }
          }
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailExists(false);
        setExistingClientInfo(null);
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(emailTimeout);
  }, [form.watch('email'), checkClientExists]);

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
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Email du client"
              {...form.register('email')}
              className={`${form.formState.errors.email ? 'border-red-500' : ''} ${emailExists ? 'border-amber-500' : ''}`}
            />
            {checkingEmail && (
              <div className="absolute right-2 top-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
          {emailExists && existingClientInfo && (
            <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-amber-800">
                  Un client avec cet email existe déjà: {existingClientInfo.full_name} (Statut: {existingClientInfo.status})
                </p>
              </div>
            </div>
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
