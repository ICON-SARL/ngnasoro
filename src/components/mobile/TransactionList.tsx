
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ArrowDown, ArrowUp, CreditCard, Banknote, RefreshCcw } from 'lucide-react';

interface Transaction {
  id: number | string;
  name: string;
  type: string;
  amount: string;
  date: string;
  avatar: string | null;
  sfdName?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewAll?: () => void;
  title?: string;
}

const TransactionList = ({ 
  transactions, 
  isLoading = false, 
  onViewAll, 
  title = "Transactions Récentes" 
}: TransactionListProps) => {
  
  const getTransactionIcon = (type: string, amount: string) => {
    if (type === 'deposit') {
      return <ArrowDown className="h-5 w-5 text-green-600" />;
    } else if (type === 'withdrawal') {
      return <ArrowUp className="h-5 w-5 text-gray-700" />;
    } else if (type === 'loan_repayment') {
      return <RefreshCcw className="h-5 w-5 text-orange-600" />;
    } else if (type === 'loan_disbursement') {
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    } else if (type === 'transfer') {
      return amount.startsWith('+') 
        ? <ArrowDown className="h-5 w-5 text-green-600" /> 
        : <ArrowUp className="h-5 w-5 text-gray-700" />;
    } else {
      return <Banknote className="h-5 w-5 text-gray-600" />;
    }
  };
  
  return (
    <div className="px-4 mt-3 mb-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        {onViewAll && (
          <Button 
            variant="link" 
            className="text-sm text-lime-600 p-0 h-auto"
            onClick={onViewAll}
          >
            Voir Prêts
          </Button>
        )}
      </div>
      
      <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            // Loading state
            Array(3).fill(0).map((_, index) => (
              <div 
                key={`skeleton-${index}`}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : transactions.length > 0 ? (
            // Transactions list
            transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 bg-lime-100">
                    {transaction.avatar ? (
                      <img src={transaction.avatar} alt={transaction.name} />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center">
                        {getTransactionIcon(transaction.type, transaction.amount)}
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500 mr-2">{transaction.date}</p>
                      {transaction.sfdName && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4 flex items-center">
                          <Building className="h-2 w-2 mr-1" />
                          {transaction.sfdName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p 
                  className={`font-semibold ${
                    transaction.amount.startsWith('+') || !transaction.amount.startsWith('-') 
                      ? 'text-lime-600' 
                      : 'text-gray-800'
                  }`}
                >
                  {transaction.amount}
                </p>
              </div>
            ))
          ) : (
            // Empty state
            <div className="p-6 text-center text-gray-500">
              Aucune transaction récente
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
