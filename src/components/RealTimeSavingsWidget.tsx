
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
}

const RealTimeSavingsWidget = () => {
  const [balance, setBalance] = useState(125000);
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 25000,
      date: '2023-05-15',
      description: 'Dépôt mensuel'
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 10000,
      date: '2023-05-10',
      description: 'Retrait'
    },
    {
      id: '3',
      type: 'deposit',
      amount: 50000,
      date: '2023-05-01',
      description: 'Virement reçu'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const refreshBalance = () => {
    setIsUpdating(true);
    
    // Simulate API call to get real-time balance
    setTimeout(() => {
      // Random slight variation to simulate real-time updates
      const variation = Math.floor(Math.random() * 10000) - 5000;
      setBalance(prevBalance => prevBalance + variation);
      
      if (variation > 0) {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'deposit',
          amount: variation,
          date: new Date().toISOString().split('T')[0],
          description: 'Intérêt'
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
      
      setIsUpdating(false);
    }, 1500);
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      refreshBalance();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Solde d'épargne</span>
          <Button variant="ghost" size="icon" onClick={toggleVisibility}>
            {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-3xl font-bold">
              {isHidden ? '••••••••' : formatCurrency(balance)}
            </div>
            <div className="text-sm text-muted-foreground">Compte épargne</div>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshBalance}
            disabled={isUpdating}
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Dernières transactions</div>
          {transactions.slice(0, 3).map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div className="flex items-center">
                {transaction.type === 'deposit' ? (
                  <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                )}
                <div>
                  <div className="text-sm font-medium">{transaction.description}</div>
                  <div className="text-xs text-muted-foreground">{transaction.date}</div>
                </div>
              </div>
              <div className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeSavingsWidget;
