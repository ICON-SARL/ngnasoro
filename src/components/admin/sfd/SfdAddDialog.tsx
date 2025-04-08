
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 rounded-xl border-none shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <DialogHeader className="mb-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-blue-700">
                Ajouter une nouvelle SFD
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
            Entrez les informations de la nouvelle institution de microfinance
          </p>
        </div>
        
        <div className="px-5 py-4">
          <SfdForm 
            onSubmit={onSubmit}
            isLoading={isLoading}
            onCancel={handleCancel}
            formMode="create"
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
