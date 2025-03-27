
import React, { useState } from 'react';
import { Transaction } from '@/types/transactions';
import { TransactionCard } from './TransactionCard';
import { TransactionDetails } from './TransactionDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowDown, ArrowUp } from 'lucide-react';

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
  title?: string;
  maxItems?: number;
  showSearch?: boolean;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  isLoading = false,
  onRefresh,
  title = "Transactions",
  maxItems,
  showSearch = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.name.toLowerCase().includes(term) ||
      tx.type.toLowerCase().includes(term) ||
      (tx.description && tx.description.toLowerCase().includes(term))
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date || a.created_at);
    const dateB = new Date(b.date || b.created_at);
    return sortDirection === 'desc' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });

  const displayTransactions = maxItems 
    ? sortedTransactions.slice(0, maxItems) 
    : sortedTransactions;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="h-8 px-2"
            >
              Actualiser
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSortDirection}
            className="h-8 w-8 p-0"
          >
            {sortDirection === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {showSearch && (
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher..." 
            className="pl-8" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      )}
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Chargement des transactions...
          </div>
        ) : displayTransactions.length > 0 ? (
          displayTransactions.map(transaction => (
            <TransactionCard 
              key={transaction.id} 
              transaction={transaction} 
              onClick={handleTransactionClick}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            Aucune transaction trouvée
          </div>
        )}
      </div>
      
      {maxItems && transactions.length > maxItems && (
        <div className="text-center mt-3">
          <Button variant="outline" size="sm">
            Voir toutes les transactions ({transactions.length})
          </Button>
        </div>
      )}
      
      <TransactionDetails 
        transaction={selectedTransaction} 
        open={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />
    </div>
  );
};
