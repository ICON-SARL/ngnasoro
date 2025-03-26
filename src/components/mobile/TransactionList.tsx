
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: number | string;
  name: string;
  type: string;
  amount: string;
  date: string;
  avatar: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

const TransactionList = ({ transactions, isLoading = false, onViewAll }: TransactionListProps) => {
  return (
    <div className="mx-4 mt-3 mb-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <Button 
          variant="link" 
          className="text-sm text-lime-600 p-0 h-auto"
          onClick={onViewAll}
        >
          View Loans
        </Button>
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
                      <span className="text-sm font-medium">{transaction.name.charAt(0)}</span>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
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
