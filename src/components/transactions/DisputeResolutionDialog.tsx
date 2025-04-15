
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface DisputeResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolution: 'accepted' | 'rejected', notes: string) => void;
  isLoading: boolean;
}

export function DisputeResolutionDialog({
  isOpen,
  onClose,
  onResolve,
  isLoading
}: DisputeResolutionDialogProps) {
  const [notes, setNotes] = useState('');
  const { user } = useAuth();

  const handleResolve = (resolution: 'accepted' | 'rejected') => {
    if (!user?.id) return;
    onResolve(resolution, notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Résoudre le litige</DialogTitle>
          <DialogDescription>
            Veuillez fournir les détails de la résolution du litige.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Notes de résolution..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleResolve('rejected')}
            disabled={isLoading}
          >
            Rejeter
          </Button>
          <Button
            onClick={() => handleResolve('accepted')}
            disabled={isLoading}
          >
            Accepter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
