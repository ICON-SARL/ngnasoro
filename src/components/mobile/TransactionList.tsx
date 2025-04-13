
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, ArrowDownLeft, CircleDollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  name: string;
  type: string;
  amount: string;
  date: string;
  avatar?: string;
  sfdName?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewAll?: () => void;
  title?: string;
  maxItems?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  onViewAll,
  title = "Transactions",
  maxItems = 5
}) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <CircleDollarSign className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-gray-800';
    }
  };

  // Display only the first maxItems transactions
  const displayTransactions = transactions.slice(0, maxItems);

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-[#0D6A51] hover:bg-[#0D6A51]/10 p-0 h-auto">
            Voir tout <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#0D6A51]"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CircleDollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Aucune transaction à afficher</p>
          </div>
        ) : (
          <div>
            {displayTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {transaction.avatar ? (
                      <img src={transaction.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="rounded-full p-2 bg-gray-100">
                        {getTransactionIcon(transaction.type)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{transaction.name}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className={`text-right ${getTransactionColor(transaction.type)}`}>
                  <p className="text-sm font-semibold">
                    {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                    {Math.abs(parseFloat(transaction.amount)).toLocaleString('fr-FR')} FCFA
                  </p>
                  {transaction.sfdName && (
                    <p className="text-xs text-gray-500">{transaction.sfdName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
