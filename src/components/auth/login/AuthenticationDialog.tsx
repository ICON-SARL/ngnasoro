
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AuthenticationSystem from '@/components/AuthenticationSystem';

interface AuthenticationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const AuthenticationDialog = ({ 
  open, 
  onOpenChange, 
  onComplete 
}: AuthenticationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AuthenticationSystem onComplete={onComplete} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationDialog;
