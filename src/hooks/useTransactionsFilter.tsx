
import { useState, useCallback } from 'react';
import { Transaction } from '@/types/transactions';

export function useTransactionsFilter({ transactions }: { transactions: Transaction[] }) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [currentFilter, setCurrentFilter] = useState({
    type: 'all',
    period: 'all',
    search: '',
  });
  
  const filterTransactions = useCallback((filters = currentFilter) => {
    const { type, period, search } = filters;
    
    const filtered = transactions.filter(tx => {
      // Filter by type
      const matchesType = type === 'all' || tx.type === type;
      
      // Filter by period
      let matchesPeriod = true;
      if (period !== 'all') {
        const txDate = new Date(tx.date || tx.created_at || '');
        const now = new Date();
        
        switch(period) {
          case 'today':
            matchesPeriod = txDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            matchesPeriod = txDate >= oneWeekAgo;
            break;
          case 'month':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            matchesPeriod = txDate >= oneMonthAgo;
            break;
          case 'year':
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            matchesPeriod = txDate >= oneYearAgo;
            break;
        }
      }
      
      // Filter by search
      const matchesSearch = !search || 
        tx.name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.reference?.toLowerCase().includes(search.toLowerCase()) || 
        tx.id?.toString().includes(search);
      
      return matchesType && matchesPeriod && matchesSearch;
    });
    
    setFilteredTransactions(filtered);
    setCurrentFilter(filters);
  }, [transactions, currentFilter]);
  
  return {
    filteredTransactions,
    filterTransactions,
    currentFilter,
  };
}
