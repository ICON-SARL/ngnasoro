
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
import { AlertTriangle } from 'lucide-react';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-lg shadow-lg border-none">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Suspendre le compte SFD
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <DialogDescription className="text-sm text-slate-700 mb-4">
            Êtes-vous sûr de vouloir suspendre le compte SFD <span className="font-semibold">"{selectedSfd?.name}"</span>?<br/>
            Cette action limitera l'accès des utilisateurs associés à cette institution.
          </DialogDescription>
      
          <div className="rounded-md bg-amber-50 px-4 py-3 border border-amber-200 mb-4">
            <p className="text-amber-800 text-sm">
              Note: La suspension du compte est réversible et le compte pourra être réactivé ultérieurement.
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
              variant="destructive" 
              onClick={() => selectedSfd && onConfirm(selectedSfd.id)}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Suspension en cours...' : 'Confirmer la suspension'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
