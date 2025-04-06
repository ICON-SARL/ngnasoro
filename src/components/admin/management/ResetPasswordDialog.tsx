
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminUser } from './types';
import { MailCheck } from 'lucide-react';

interface ResetPasswordDialogProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (admin: AdminUser) => Promise<void>;
  isLoading: boolean;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  admin,
  isOpen,
  onClose,
  onResetPassword,
  isLoading
}) => {
  const [resetSent, setResetSent] = useState(false);
  
  if (!admin) return null;
  
  const handleResetPassword = async () => {
    await onResetPassword(admin);
    setResetSent(true);
  };
  
  const handleClose = () => {
    setResetSent(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        </DialogHeader>
        
        {resetSent ? (
          <div className="py-6 flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <MailCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email envoyé !</h3>
            <p className="text-center text-muted-foreground">
              Un lien de réinitialisation a été envoyé à <br />
              <span className="font-medium">{admin.email}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-muted-foreground mb-4">
                Un email avec un lien de réinitialisation sera envoyé à l'adresse de l'administrateur.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={admin.email} 
                  disabled
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
