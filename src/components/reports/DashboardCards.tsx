
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total des transactions
          </CardTitle>
          <CardDescription>
            Période actuelle
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
            Période actuelle
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Transactions par type
          </CardTitle>
          <CardDescription>
            Répartition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(transactions.map(tx => tx.type))).map(type => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}: {transactions.filter(tx => tx.type === type).length}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
