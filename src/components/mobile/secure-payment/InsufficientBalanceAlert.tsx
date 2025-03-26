
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsufficientBalanceAlertProps {
  show: boolean;
  onRecharge?: () => void;
}

export const InsufficientBalanceAlert: React.FC<InsufficientBalanceAlertProps> = ({ 
  show,
  onRecharge 
}) => {
  if (!show) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-600">Solde insuffisant</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">Votre compte SFD principal n'a pas un solde suffisant. Nous avons automatiquement sélectionné le paiement par Mobile Money.</p>
        {onRecharge && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-1 border-amber-300 hover:bg-amber-100 text-amber-700"
            onClick={onRecharge}
          >
            Recharger mon compte <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
