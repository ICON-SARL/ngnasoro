
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PaymentMethodSelectorProps {
  insufficientBalance: boolean;
  isWithdrawal: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  insufficientBalance,
  isWithdrawal
}) => {
  return (
    <div className="space-y-3">
      {insufficientBalance && isWithdrawal && (
        <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertDescription className="text-sm">
            Solde SFD insuffisant pour ce retrait.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Mobile Money</h3>
            <p className="text-sm text-gray-500">
              {isWithdrawal ? 'Retirez via votre compte mobile money' : 'Déposez via votre compte mobile money'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethodSelector;
