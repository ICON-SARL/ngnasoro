
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
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
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-[#0D6A51]/10 to-[#0D6A51]/5 px-6 py-4 border-b">
          <DialogTitle className="text-[#0D6A51] flex items-center text-xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
              <div className="space-y-3">
                <h3 className="font-medium text-base">Informations générales</h3>
                <SfdBasicInfoFields form={form} />
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-3">
                <h3 className="font-medium text-base">Coordonnées</h3>
                <SfdContactFields form={form} />
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-3">
                <h3 className="font-medium text-base">Informations financières</h3>
                <SfdFinanceFields form={form} />
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-3">
                <h3 className="font-medium text-base">Pièces justificatives</h3>
                <SfdFileUploadFields
                  logoFile={logoFile}
                  documentFile={documentFile}
                  handleLogoChange={handleLogoChange}
                  handleDocumentChange={handleDocumentChange}
                />
              </div>
              
              <div className="flex justify-end items-center gap-3 sticky bottom-0 pt-4 pb-2 bg-white border-t mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="border-gray-300"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending || isUploading}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  {isPending || isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
