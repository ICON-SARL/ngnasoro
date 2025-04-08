
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose 
} from '@/components/ui/dialog';
import { Sfd } from '../types/sfd-types';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SfdReactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSfd: Sfd | null;
  onConfirm: (sfdId: string) => void;
  isPending: boolean;
}

export function SfdReactivateDialog({ 
  open, 
  onOpenChange, 
  selectedSfd, 
  onConfirm, 
  isPending 
}: SfdReactivateDialogProps) {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = () => {
    if (!selectedSfd) return;
    
    setShowError(false);
    try {
      onConfirm(selectedSfd.id);
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur s'est produite lors de la réactivation");
      setShowError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-lg shadow-lg border-none max-h-[85vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réactiver le compte SFD
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-4">
          <DialogDescription className="text-sm text-slate-700 mb-3">
            Êtes-vous sûr de vouloir réactiver le compte SFD <span className="font-semibold">"{selectedSfd?.name}"</span>?<br/>
            Cette action rétablira l'accès complet pour cette institution et ses utilisateurs.
          </DialogDescription>
      
          <div className="rounded-md bg-blue-50 px-3 py-2 border border-blue-200 mb-3">
            <p className="text-blue-800 text-xs">
              Une notification sera envoyée aux administrateurs de la SFD pour les informer de la réactivation de leur compte.
            </p>
          </div>

          {showError && (
            <Alert variant="destructive" className="my-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="px-4 py-3 bg-gray-50 border-t">
          <div className="flex justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-700 h-8 text-sm"
              size="sm"
            >
              Annuler
            </Button>
            
            <Button 
              variant="default" 
              onClick={handleConfirm}
              disabled={isPending || !selectedSfd}
              className="bg-green-600 hover:bg-green-700 h-8 text-sm"
              size="sm"
            >
              {isPending ? 'Réactivation...' : 'Confirmer la réactivation'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
