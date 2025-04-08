
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
import { X } from 'lucide-react';

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: SfdFormValues) => void;
  isLoading: boolean;
}

export function SfdAddDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading 
}: SfdAddDialogProps) {
  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-xl border-none shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <DialogHeader className="mb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold text-blue-700">
                Ajouter une nouvelle SFD
              </DialogTitle>
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">
            Entrez les informations de la nouvelle institution de microfinance
          </p>
        </div>
        
        <div className="px-6 py-4">
          <SfdForm 
            onSubmit={onSubmit}
            isLoading={isLoading}
            onCancel={handleCancel}
            formMode="create"
          />
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-end gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
              className="border-gray-300"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              form="sfd-form"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Traitement en cours...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
