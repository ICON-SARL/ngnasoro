
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileMoneyTab } from './MobileMoneyTab';
import { AgencyTab } from './AgencyTab';
import { Progress } from '@/components/ui/progress';

interface PaymentMethodTabsProps {
  paymentMethod: string;
  balanceStatus: 'sufficient' | 'insufficient';
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  onPaymentMethodChange: (value: string) => void;
  handlePayment: () => void;
  isWithdrawal?: boolean;
}

export const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({ 
  paymentMethod, 
  balanceStatus,
  paymentStatus,
  onPaymentMethodChange,
  handlePayment,
  isWithdrawal = false
}) => {
  return (
    <Tabs value={paymentMethod} onValueChange={onPaymentMethodChange}>
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger 
          value="sfd" 
          className="flex items-center gap-1.5"
          disabled={paymentStatus === 'pending'}
        >
          <Building className="h-4 w-4" />
          SFD
        </TabsTrigger>
        <TabsTrigger 
          value="mobile" 
          className="flex items-center gap-1.5"
          disabled={paymentStatus === 'pending'}
        >
          <Smartphone className="h-4 w-4" />
          Mobile Money
        </TabsTrigger>
      </TabsList>
      
      {paymentStatus === 'pending' && (
        <div className="space-y-2 my-4">
          <Progress value={paymentStatus === 'pending' ? 50 : 100} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {isWithdrawal 
              ? "Traitement de votre retrait..." 
              : "Traitement de votre paiement..."
            }
          </p>
        </div>
      )}
      
      <TabsContent value="sfd">
        <AgencyTab 
          paymentStatus={paymentStatus}
          handlePayment={handlePayment}
          isWithdrawal={isWithdrawal}
        />
      </TabsContent>
      
      <TabsContent value="mobile">
        <MobileMoneyTab 
          paymentStatus={paymentStatus}
          handlePayment={handlePayment}
          isWithdrawal={isWithdrawal}
        />
      </TabsContent>
    </Tabs>
  );
};
