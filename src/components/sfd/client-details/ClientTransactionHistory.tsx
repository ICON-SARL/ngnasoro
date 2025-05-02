
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionQuery } from '@/hooks/transactions/useTransactionQuery';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientTransactionHistoryProps {
  clientId: string;
}

const ClientTransactionHistory: React.FC<ClientTransactionHistoryProps> = ({ clientId }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { transactions, isLoading, refetch } = useTransactionQuery(undefined, undefined, { 
    search: clientId,
    limit: 10
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historique des transactions</CardTitle>
          <CardDescription>Dernières opérations effectuées</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'deposit' || transaction.type === 'loan_disbursement' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.name}</div>
                    <div className="text-xs text-gray-500">
                      {transaction.date && format(new Date(transaction.date), 'PPp', { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                    ? '+' 
                    : '-'
                  } {Math.abs(transaction.amount).toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucune transaction trouvée pour ce client
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientTransactionHistory;
