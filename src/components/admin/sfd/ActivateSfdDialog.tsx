
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sfd } from '../types/sfd-types';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ActivateSfdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfd: Sfd | null;
  onActivate: () => void;
  isLoading: boolean;
}

export function ActivateSfdDialog({
  open,
  onOpenChange,
  sfd,
  onActivate,
  isLoading,
}: ActivateSfdDialogProps) {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!sfd) return null;
  
  const handleActivate = () => {
    setShowError(false);
    try {
      onActivate();
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur s'est produite lors de l'activation");
      setShowError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-lg shadow-lg border-none max-h-[85vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Activer la SFD
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-4">
          <DialogDescription className="text-sm text-slate-700 mb-3">
            Êtes-vous sûr de vouloir activer <span className="font-semibold">{sfd.name}</span>?<br/>
            Cette action permettra à la SFD d'être complètement fonctionnelle.
          </DialogDescription>

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
              disabled={isLoading}
              className="text-slate-700 h-8 text-sm"
              size="sm"
            >
              Annuler
            </Button>
            
            <Button
              variant="default"
              onClick={handleActivate}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-8 text-sm"
              size="sm"
            >
              {isLoading ? "Activation..." : "Confirmer l'activation"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
