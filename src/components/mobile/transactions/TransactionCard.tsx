
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, CreditCard, Coins } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TransactionProps {
  transaction: {
    id: string;
    name: string;
    type: string;
    amount: number;
    date: Date;
  };
  onClick?: () => void;
}

const TransactionCard: React.FC<TransactionProps> = ({ transaction, onClick }) => {
  // Determine icon based on transaction type
  const getIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDown className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUp className="h-5 w-5 text-amber-500" />;
      case 'loan_repayment':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      default:
        return <Coins className="h-5 w-5 text-gray-500" />; // Changed from Coin to Coins
    }
  };

  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className={`p-2 rounded-full mr-3 ${
            transaction.type === 'deposit' ? 'bg-green-100' : 
            transaction.type === 'withdrawal' ? 'bg-amber-100' : 
            transaction.type === 'loan_repayment' ? 'bg-blue-100' : 
            'bg-gray-100'
          }`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{transaction.name}</h3>
            <p className="text-xs text-gray-500">
              {transaction.date.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${
              transaction.amount > 0 ? 'text-green-600' : 
              transaction.amount < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
