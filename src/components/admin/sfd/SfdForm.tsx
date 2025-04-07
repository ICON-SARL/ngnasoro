
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Sfd } from '../types/sfd-types';
import { SfdFormValues } from './schemas/sfdFormSchema';
import { useSfdForm } from './hooks/useSfdForm';
import { SfdBasicInfoFields } from './components/SfdBasicInfoFields';
import { SfdContactFields } from './components/SfdContactFields';
import { SfdFinanceFields } from './components/SfdFinanceFields';
import { SfdFileUploadFields } from './components/SfdFileUploadFields';

interface SfdFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SfdFormValues) => void;
  initialData?: Partial<Sfd>;
  title: string;
  isPending: boolean;
}

export function SfdForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  isPending,
}: SfdFormProps) {
  const {
    form,
    logoFile,
    documentFile,
    isUploading,
    handleLogoChange,
    handleDocumentChange,
    handleFormSubmit,
  } = useSfdForm({ initialData, onSubmit });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <SfdBasicInfoFields form={form} />
            <SfdContactFields form={form} />
            <SfdFinanceFields form={form} />
            <SfdFileUploadFields
              logoFile={logoFile}
              documentFile={documentFile}
              handleLogoChange={handleLogoChange}
              handleDocumentChange={handleDocumentChange}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || isUploading}>
                {isPending || isUploading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
