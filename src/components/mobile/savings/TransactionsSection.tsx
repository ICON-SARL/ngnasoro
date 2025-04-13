
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Transaction } from '@/hooks/useTransactions';

interface TransactionsSectionProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ 
  transactions,
  isLoading 
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Dernières transactions</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Clock className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Aucune transaction à afficher</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium">{transaction.name}</p>
                  <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className={transaction.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, 'FCFA')}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full mt-3 text-[#0D6A51]"
          onClick={() => navigate('/mobile-flow/transactions')}
        >
          Voir toutes les transactions
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransactionsSection;
