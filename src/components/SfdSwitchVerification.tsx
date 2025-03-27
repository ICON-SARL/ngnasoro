
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Check, X } from "lucide-react";

interface SfdSwitchVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  sfdName: string;
  isLoading: boolean;
}

const SfdSwitchVerification: React.FC<SfdSwitchVerificationProps> = ({
  isOpen,
  onClose,
  onVerify,
  sfdName,
  isLoading
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('Veuillez saisir un code valide');
      return;
    }

    setError(null);
    const success = await onVerify(verificationCode);
    
    if (!success) {
      setError('Code de vérification incorrect');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Vérification requise
          </DialogTitle>
          <DialogDescription>
            Pour des raisons de sécurité, veuillez confirmer le changement vers l'institution <strong>{sfdName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800 mb-4">
          Un code de vérification a été envoyé à votre téléphone. Veuillez saisir ce code pour confirmer le changement.
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="verification-code" className="text-sm font-medium mb-1 block">
              Code de vérification
            </label>
            <Input
              id="verification-code"
              placeholder="Saisissez le code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-center text-lg letter-spacing-wide font-mono"
              maxLength={6}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={isLoading || !verificationCode}
            className="flex items-center"
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Vérifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SfdSwitchVerification;
