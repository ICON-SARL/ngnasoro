
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';

interface SfdVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  sfdName: string;
  isLoading: boolean;
}

const SfdVerificationDialog: React.FC<SfdVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  sfdName,
  isLoading
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Veuillez entrer un code de vérification');
      return;
    }

    try {
      const success = await onVerify(verificationCode);
      if (!success) {
        setError('Code de vérification incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la vérification');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vérification requise</DialogTitle>
          <DialogDescription>
            Pour changer vers {sfdName}, veuillez saisir le code de vérification envoyé à votre téléphone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            placeholder="Code de vérification"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value);
              setError('');
            }}
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleVerify} disabled={isLoading || !verificationCode}>
            {isLoading ? <Loader size="sm" className="mr-2" /> : null}
            Vérifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SfdVerificationDialog;
