
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface InsufficientBalanceAlertProps {
  show: boolean;
}

export const InsufficientBalanceAlert: React.FC<InsufficientBalanceAlertProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-600">Solde insuffisant</AlertTitle>
      <AlertDescription className="text-amber-700">
        Votre compte SFD principal n'a pas un solde suffisant. Nous avons automatiquement sélectionné le paiement par Mobile Money.
      </AlertDescription>
    </Alert>
  );
};
