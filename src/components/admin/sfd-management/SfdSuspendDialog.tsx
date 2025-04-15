
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

interface SfdSuspendDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  selectedSfd: Sfd | null;
  suspendSfdMutation: UseMutationResult<any, Error, string, unknown>;
}

export function SfdSuspendDialog({
  open,
  onOpenChange,
  selectedSfd,
  suspendSfdMutation
}: SfdSuspendDialogProps) {
  if (!selectedSfd) return null;

  const handleSuspend = () => {
    suspendSfdMutation.mutate(selectedSfd.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspendre le SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir suspendre le SFD {selectedSfd.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSuspend} 
            disabled={suspendSfdMutation.isPending}
          >
            Suspendre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
