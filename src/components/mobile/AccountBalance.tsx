
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import QuickActionButtons from './QuickActionButtons';

interface AccountBalanceProps {
  onActionClick: (action: string) => void;
}

const AccountBalance = ({ onActionClick }: AccountBalanceProps) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-gray-600 mb-1">Solde total</p>
        <h1 className="text-3xl font-bold mb-5">155 804 FCFA</h1>
        
        <QuickActionButtons onActionClick={onActionClick} />
      </CardContent>
    </Card>
  );
};

export default AccountBalance;
