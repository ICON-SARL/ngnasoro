
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowUp, ArrowDown, Calendar, Filter, Loader2 } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  filterType: string;
  setFilterType: React.Dispatch<React.SetStateAction<string>>;
  filterPeriod: string;
  setFilterPeriod: React.Dispatch<React.SetStateAction<string>>;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  filterType,
  setFilterType,
  filterPeriod,
  setFilterPeriod
}) => {
  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(tx => {
    // Filter by type
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }
    
    // Filter by period
    if (filterPeriod !== 'all') {
      const txDate = new Date(tx.date || tx.created_at || '');
      const now = new Date();
      
      switch (filterPeriod) {
        case 'today':
          return txDate.toDateString() === now.toDateString();
        case 'week':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return txDate >= oneWeekAgo;
        case 'month':
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return txDate >= oneMonthAgo;
        default:
          return true;
      }
    }
    
    return true;
  });

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Historique des transactions</h2>
        <Button variant="ghost" className="text-sm text-primary p-0 h-auto">
          Voir tout <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="deposit">Dépôts</SelectItem>
            <SelectItem value="withdrawal">Retraits</SelectItem>
            <SelectItem value="loan_repayment">Remboursements</SelectItem>
            <SelectItem value="loan_disbursement">Décaissements</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-36">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les périodes</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium mb-1">Pas de transactions</h3>
              <p className="text-sm text-gray-500">Aucune transaction ne correspond à vos critères</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filteredTransactions.map(transaction => (
                <li key={transaction.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">
                        {transaction.name || 
                         (transaction.type === 'deposit' ? 'Dépôt' : 
                          transaction.type === 'withdrawal' ? 'Retrait' : 
                          transaction.type === 'loan_repayment' ? 'Remboursement' : 
                          transaction.type === 'loan_disbursement' ? 'Décaissement' : 'Transaction')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.date || transaction.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? '+' : '-'}
                    {formatCurrencyAmount(Math.abs(Number(transaction.amount)))}
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
