
import { useState, useCallback } from 'react';
import { Transaction } from '@/types/transactions';
import { UseTransactionsFilterProps } from '@/types/realtimeTransactions';
import { safeIdToString } from '@/utils/transactionUtils';

export function useTransactionsFilter({ transactions }: UseTransactionsFilterProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  
  const filterTransactions = useCallback((searchTerm: string = '', status: string | null = null) => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => {
        const id = typeof tx.id === 'number' ? tx.id.toString() : tx.id;
        return (tx.description && tx.description.toLowerCase().includes(term)) ||
          id.toLowerCase().includes(term) ||
          tx.type.toLowerCase().includes(term) ||
          (tx.payment_method && tx.payment_method.toLowerCase().includes(term)) ||
          (tx.name && tx.name.toLowerCase().includes(term));
      });
    }
    
    if (status) {
      filtered = filtered.filter(tx => tx.status === status);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions]);

  return {
    filteredTransactions,
    filterTransactions
  };
}
