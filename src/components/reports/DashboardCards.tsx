
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, CreditCard, Users, CircleDollarSign, TrendingUp } from 'lucide-react';
import { Transaction } from '@/types/transactions';

interface DashboardCardsProps {
  transactions: Transaction[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ transactions }) => {
  // Calculer les statistiques des transactions
  const calculateStats = () => {
    if (!transactions.length) {
      return {
        totalAmount: 0,
        incomingAmount: 0,
        outgoingAmount: 0,
        transactionCount: 0,
        percentageChange: 0
      };
    }

    let totalAmount = 0;
    let incomingAmount = 0;
    let outgoingAmount = 0;
    
    transactions.forEach(tx => {
      const amount = Number(tx.amount);
      totalAmount += amount;
      
      if (tx.type === 'deposit' || tx.type === 'loan_disbursement' || tx.type === 'transfer_in') {
        incomingAmount += amount;
      } else if (tx.type === 'withdrawal' || tx.type === 'loan_repayment' || tx.type === 'transfer_out') {
        outgoingAmount += amount;
      }
    });
    
    return {
      totalAmount,
      incomingAmount,
      outgoingAmount,
      transactionCount: transactions.length,
      percentageChange: 5.2 // Exemple de valeur pour la démo
    };
  };
  
  const stats = calculateStats();

  // Formater les montants en FCFA
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Volume Total
          </CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-500">{stats.percentageChange}%</span> depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Entrées
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(stats.incomingAmount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.incomingAmount / stats.totalAmount) * 100) || 0}% du volume total
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sorties
          </CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(stats.outgoingAmount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.outgoingAmount / stats.totalAmount) * 100) || 0}% du volume total
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Transactions
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.transactionCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Nombre total de transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
