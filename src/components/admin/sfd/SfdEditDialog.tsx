import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { SfdFormValues } from './schemas/sfdFormSchema';
import { SfdForm } from './SfdForm';
import { Sfd } from '../types/sfd-types';
import { X } from 'lucide-react';

interface SfdEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfd: Sfd;
  onSubmit: (formData: SfdFormValues) => void;
  isLoading: boolean;
}

export function SfdEditDialog({ 
  open, 
  onOpenChange, 
  sfd,
  onSubmit, 
  isLoading 
}: SfdEditDialogProps) {
  // Convert the Sfd type to SfdFormValues
  const defaultValues: SfdFormValues = {
    name: sfd.name,
    code: sfd.code,
    region: sfd.region || '',
    description: sfd.description || '',
    contact_email: sfd.contact_email || '',
    phone: sfd.phone || '',
    address: sfd.address || '',
    email: sfd.email || '',
    status: sfd.status as 'active' | 'pending' | 'suspended',
    logo_url: sfd.logo_url || '',
    legal_document_url: sfd.legal_document_url || '',
    subsidy_balance: sfd.subsidy_balance || 0,
  };

  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 rounded-xl border-none shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <DialogHeader className="mb-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-blue-700">
                Modifier: {sfd.name}
              </DialogTitle>
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full" 
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Modifiez les informations de cette institution de microfinance
          </p>
        </div>
        
        <div className="px-5 py-4">
          <SfdForm 
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isLoading={isLoading}
            onCancel={handleCancel}
            formMode="edit"
            sfdId={sfd.id}
          />
        </div>
        
        <DialogFooter className="px-5 py-3 bg-gray-50 border-t">
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
              className="border-gray-300 h-9"
              size="sm"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              form="sfd-form"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9"
              size="sm"
            >
              {isLoading ? 'Traitement...' : 'Enregistrer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
