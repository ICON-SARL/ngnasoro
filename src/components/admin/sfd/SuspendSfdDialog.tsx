
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
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SuspendSfdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSfd: Sfd | null;
  onConfirm: (sfdId: string) => void;
  isPending: boolean;
}

export function SuspendSfdDialog({ 
  open, 
  onOpenChange, 
  selectedSfd, 
  onConfirm, 
  isPending 
}: SuspendSfdDialogProps) {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = () => {
    if (!selectedSfd) return;
    
    setShowError(false);
    try {
      onConfirm(selectedSfd.id);
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur s'est produite lors de la suspension");
      setShowError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-lg shadow-lg border-none max-h-[85vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Suspendre le compte SFD
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-4">
          <DialogDescription className="text-sm text-slate-700 mb-3">
            Êtes-vous sûr de vouloir suspendre le compte SFD <span className="font-semibold">"{selectedSfd?.name}"</span>?<br/>
            Cette action limitera l'accès des utilisateurs associés à cette institution.
          </DialogDescription>
      
          <div className="rounded-md bg-amber-50 px-3 py-2 border border-amber-200 mb-3">
            <p className="text-amber-800 text-xs">
              Note: La suspension du compte est réversible et le compte pourra être réactivé ultérieurement.
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
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isPending || !selectedSfd}
              className="bg-red-600 hover:bg-red-700 h-8 text-sm"
              size="sm"
            >
              {isPending ? 'Suspension...' : 'Confirmer la suspension'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
