
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

interface SfdReactivateDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  selectedSfd: Sfd | null;
  reactivateSfdMutation: UseMutationResult<any, Error, string, unknown>;
}

export function SfdReactivateDialog({
  open,
  onOpenChange,
  selectedSfd,
  reactivateSfdMutation
}: SfdReactivateDialogProps) {
  if (!selectedSfd) return null;

  const handleReactivate = () => {
    reactivateSfdMutation.mutate(selectedSfd.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réactiver le SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir réactiver le SFD {selectedSfd.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleReactivate} disabled={reactivateSfdMutation.isPending}>
            Réactiver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
