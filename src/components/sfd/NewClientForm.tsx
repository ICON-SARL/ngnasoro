
import React from 'react';
import { Form } from '@/components/ui/form';
import { ClientCodeSearchSection } from './ClientCodeSearchSection';
import { ClientFormFields } from './client-form/ClientFormFields';
import { ClientFormActions } from './client-form/ClientFormActions';
import { useClientForm } from './client-form/useClientForm';
import { FormProvider } from 'react-hook-form';

interface NewClientFormProps {
  onSuccess: () => void;
}

export function NewClientForm({ onSuccess }: NewClientFormProps) {
  const { form, isSubmitting, handleClientFound, onSubmit } = useClientForm(onSuccess);

  return (
    <div className="space-y-6">
      <ClientCodeSearchSection onClientFound={handleClientFound} />
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ClientFormFields />
          <ClientFormActions
            isSubmitting={isSubmitting}
            onReset={() => form.reset()}
          />
        </form>
      </FormProvider>
    </div>
  );
}
