
import React from 'react';
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
import { RefreshCw } from 'lucide-react';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-lg shadow-lg border-none">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-semibold text-green-600 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Réactiver le compte SFD
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <DialogDescription className="text-sm text-slate-700 mb-4">
            Êtes-vous sûr de vouloir réactiver le compte SFD <span className="font-semibold">"{selectedSfd?.name}"</span>?<br/>
            Cette action rétablira l'accès complet pour cette institution et ses utilisateurs.
          </DialogDescription>
      
          <div className="rounded-md bg-blue-50 px-4 py-3 border border-blue-200 mb-4">
            <p className="text-blue-800 text-sm">
              Une notification sera envoyée aux administrateurs de la SFD pour les informer de la réactivation de leur compte.
            </p>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-slate-700"
            >
              Annuler
            </Button>
            
            <Button 
              variant="default" 
              onClick={() => selectedSfd && onConfirm(selectedSfd.id)}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? 'Réactivation en cours...' : 'Confirmer la réactivation'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
