
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UseMutationResult } from "@tanstack/react-query";
import { Sfd } from "@/types/sfd-types";

interface SfdActivateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  selectedSfd: Sfd | null;
  activateSfdMutation: UseMutationResult<any, Error, string, unknown>;
}

export function SfdActivateDialog({ 
  open,
  onOpenChange,
  selectedSfd,
  activateSfdMutation
}: SfdActivateDialogProps) {
  if (!selectedSfd) return null;
  
  const handleActivate = () => {
    activateSfdMutation.mutate(selectedSfd.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activer le SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir activer le SFD {selectedSfd.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleActivate} disabled={activateSfdMutation.isPending}>
            Activer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
