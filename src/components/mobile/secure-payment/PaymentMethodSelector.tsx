
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentMethodSelectorProps {
  selectedMethod: 'qrcode' | 'mobile';
  onMethodChange: (method: 'qrcode' | 'mobile') => void;
  insufficientBalance: boolean;
  isWithdrawal: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  insufficientBalance,
  isWithdrawal
}) => {
  return (
    <div className="space-y-3">
      {insufficientBalance && isWithdrawal && (
        <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertDescription className="text-sm">
            Solde SFD insuffisant pour ce retrait. Vous pouvez tout de même utiliser le mode QR code si vous faites un dépôt avant.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={selectedMethod} onValueChange={(value) => onMethodChange(value as 'qrcode' | 'mobile')} className="w-full">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="qrcode">
            <Building className="h-4 w-4 mr-2" />
            Code QR
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Phone className="h-4 w-4 mr-2" />
            Mobile Money
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="p-3 bg-gray-50 rounded-md text-sm">
        {selectedMethod === 'qrcode' ? (
          <div className="text-center">
            <p>Scannez un code QR en agence SFD pour {isWithdrawal ? 'effectuer votre retrait' : 'effectuer votre paiement'}.</p>
          </div>
        ) : (
          <div className="text-center">
            <p>Utilisez votre compte mobile money pour {isWithdrawal ? 'recevoir vos fonds' : 'effectuer votre paiement'}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
