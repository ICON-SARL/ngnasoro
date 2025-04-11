
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Transaction } from '@/types/transactions';
import { ArrowDown, ArrowUp, CreditCard, Users, Wallet } from 'lucide-react';

interface DashboardCardsProps {
  transactions: Transaction[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ transactions }) => {
  // Calculate total amount
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Count number of transactions
  const transactionCount = transactions.length;
  
  // Calculate inflow (deposits, transfers in)
  const inflow = transactions
    .filter(tx => ["deposit", "transfer_in"].includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  // Calculate outflow (withdrawals, transfers out)
  const outflow = transactions
    .filter(tx => ["withdrawal", "transfer_out"].includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Volume total
          </CardTitle>
          <CardDescription>
            Toutes transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactionCount} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Entrées
          </CardTitle>
          <CardDescription>
            Dépôts et transferts entrants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(inflow)}</div>
          <div className="flex items-center text-xs text-green-600 mt-1">
            <ArrowUp className="h-4 w-4 mr-1" />
            <span>Entrées de fonds</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Sorties
          </CardTitle>
          <CardDescription>
            Retraits et transferts sortants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(outflow)}</div>
          <div className="flex items-center text-xs text-red-600 mt-1">
            <ArrowDown className="h-4 w-4 mr-1" />
            <span>Sorties de fonds</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Balance
          </CardTitle>
          <CardDescription>
            Solde net
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(inflow - outflow)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Période sélectionnée
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
