
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Phone } from 'lucide-react';
import { SFDAccountTab } from './SFDAccountTab';
import { MobileMoneyTab } from './MobileMoneyTab';
import { SfdAccount } from '@/hooks/sfd/types';

interface PaymentMethodTabsProps {
  paymentMethod: string;
  balanceStatus: 'sufficient' | 'insufficient';
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  onPaymentMethodChange: (value: string) => void;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  selectedSfdAccount?: SfdAccount | null;
  syncedAccountsList?: SfdAccount[];
}

export const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({
  paymentMethod,
  balanceStatus,
  paymentStatus,
  onPaymentMethodChange,
  handlePayment,
  isWithdrawal = false,
  selectedSfdAccount,
  syncedAccountsList = []
}) => {
  return (
    <Tabs defaultValue={paymentMethod} onValueChange={onPaymentMethodChange} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger 
          value="sfd" 
          disabled={balanceStatus === 'insufficient'}
          className={balanceStatus === 'insufficient' ? 'opacity-50' : ''}
        >
          <Building className="h-4 w-4 mr-2" />
          Compte SFD
        </TabsTrigger>
        <TabsTrigger value="mobile">
          <Phone className="h-4 w-4 mr-2" />
          Mobile Money
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="sfd" className="space-y-4">
        <SFDAccountTab 
          paymentStatus={paymentStatus} 
          handlePayment={handlePayment}
          isWithdrawal={isWithdrawal}
          selectedSfdAccount={selectedSfdAccount}
          syncedAccountsList={syncedAccountsList}
        />
      </TabsContent>
      
      <TabsContent value="mobile" className="space-y-4">
        <MobileMoneyTab 
          paymentStatus={paymentStatus} 
          handlePayment={handlePayment}
          isWithdrawal={isWithdrawal}
        />
      </TabsContent>
    </Tabs>
  );
};
