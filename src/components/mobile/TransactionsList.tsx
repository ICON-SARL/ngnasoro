
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, CircleDollarSign } from 'lucide-react';

interface Transaction {
  id: number;
  name: string;
  type: string;
  amount: string;
  date: string;
  avatar: string | null;
}

interface TransactionsListProps {
  transactions: Transaction[];
  month: string;
}

const TransactionsList = ({ transactions, month }: TransactionsListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Transactions</h2>
        <Button variant="outline" size="sm" className="text-xs h-8 flex items-center gap-1">
          {month}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-[#0D6A51]">
                {transaction.avatar ? (
                  <img src={transaction.avatar} alt={transaction.name} className="h-10 w-10 rounded-full" />
                ) : (
                  <CircleDollarSign className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{transaction.name}</p>
                <p className="text-xs text-gray-500">{transaction.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-800'}`}>
                {transaction.amount} FCFA
              </p>
              <p className="text-xs text-gray-500">{transaction.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;
