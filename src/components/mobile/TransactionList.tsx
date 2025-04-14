import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { formatDate } from '@/utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onViewAll: () => void;
  title?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading, onViewAll, title = "Transactions récentes" }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button 
          variant="ghost" 
          className="text-sm text-[#0D6A51] p-0 h-auto font-medium"
          onClick={onViewAll}
        >
          Voir tout <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#0D6A51]" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDown className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Pas de transactions</h3>
              <p className="text-sm text-gray-500">Vous n'avez pas encore de transactions</p>
            </div>
          ) : (
            <ul className="divide-y">
              {transactions.slice(0, 5).map((transaction) => (
                <li key={transaction.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{transaction.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.date || transaction.created_at || '')}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {typeof transaction.amount === 'string' ? transaction.amount : 
                     (transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? '+' : '-') + 
                     (typeof transaction.amount === 'number' ? transaction.amount.toLocaleString() : transaction.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
