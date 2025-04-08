
import React from 'react';
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
import { CheckCircle } from 'lucide-react';

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
  if (!sfd) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-lg shadow-lg border-none">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Activer la SFD
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-5">
          <DialogDescription className="text-sm text-slate-700 mb-3">
            Êtes-vous sûr de vouloir activer <span className="font-semibold">{sfd.name}</span>?<br/>
            Cette action permettra à la SFD d'être complètement fonctionnelle.
          </DialogDescription>
        </div>

        <DialogFooter className="px-5 py-3 bg-gray-50 border-t">
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
              onClick={onActivate}
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
