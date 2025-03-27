
import { useState, useCallback } from 'react';
import { TransactionFilters } from '@/services/transactions/types';

export function useTransactionFilters() {
  const [filters, setFilters] = useState<TransactionFilters>({});

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const setDateRange = useCallback((startDate?: string, endDate?: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      startDate,
      endDate
    }));
  }, []);

  const setAmountRange = useCallback((minAmount?: number, maxAmount?: number) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      minAmount,
      maxAmount
    }));
  }, []);

  return {
    filters,
    updateFilters,
    clearFilters,
    setDateRange,
    setAmountRange
  };
}
