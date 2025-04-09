
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TransactionHistory: React.FC = () => {
  // Sample transaction data
  const transactions = [
    { id: 1, type: 'deposit', amount: 25000, date: '2025-04-05', status: 'completed', description: 'Dépôt Mobile Money' },
    { id: 2, type: 'withdrawal', amount: -15000, date: '2025-04-02', status: 'completed', description: 'Retrait Mobile Money' },
    { id: 3, type: 'loan_payment', amount: -5000, date: '2025-03-29', status: 'completed', description: 'Remboursement prêt' }
  ];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.amount.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
