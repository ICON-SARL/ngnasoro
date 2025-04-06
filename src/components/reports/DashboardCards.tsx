
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transactions';

interface DashboardCardsProps {
  transactions: Transaction[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ transactions }) => {
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const averageAmount = transactions.length > 0 
    ? totalAmount / transactions.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total des transactions
          </CardTitle>
          <CardDescription>
            Période sélectionnée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {transactions.length}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Volume total
          </CardTitle>
          <CardDescription>
            Période sélectionnée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAmount.toLocaleString()} FCFA
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Montant moyen
          </CardTitle>
          <CardDescription>
            Par transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(averageAmount).toLocaleString()} FCFA
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
