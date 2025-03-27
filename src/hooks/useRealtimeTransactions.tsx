
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transactions';
import { useTransactionsFetch } from '@/hooks/useTransactionsFetch';
import { useTransactionsStats } from '@/hooks/useTransactionsStats';
import { useTransactionsFilter } from '@/hooks/useTransactionsFilter';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { convertDatabaseRecordsToTransactions } from '@/utils/transactionUtils';

export function useRealtimeTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  
  // Use our new modular hooks
  const { fetchTransactions, isLoading } = useTransactionsFetch({ 
    activeSfdId, 
    userId: user?.id, 
    toast 
  });
  
  const { stats, calculateStats } = useTransactionsStats({ transactions });
  
  const { filteredTransactions, filterTransactions } = useTransactionsFilter({ 
    transactions 
  });
  
  // Handle realtime updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (!payload) return;
    
    const eventType = payload.eventType as string;
    const newRecord = payload.new as any;
    const oldRecord = payload.old as any;
    
    const currentTransactions = [...transactions];
    let updatedTransactions = currentTransactions;
    
    if (eventType === 'INSERT' && newRecord) {
      const newTx: Transaction = {
        id: newRecord.id,
        user_id: newRecord.user_id,
        sfd_id: newRecord.sfd_id || activeSfdId,
        type: newRecord.type as Transaction['type'],
        amount: newRecord.amount,
        status: newRecord.status || 'success',
        created_at: newRecord.created_at || newRecord.date || new Date().toISOString(),
        name: newRecord.name,
        date: newRecord.date,
        avatar_url: newRecord.avatar_url,
        description: `Transaction for ${newRecord.name}`,
      };
      
      updatedTransactions = [newTx, ...currentTransactions];
      
      toast({
        title: 'New transaction',
        description: `${newTx.type} of ${newTx.amount} FCFA`,
      });
    } else if (eventType === 'UPDATE' && newRecord) {
      updatedTransactions = currentTransactions.map(tx => {
        if (tx.id === newRecord.id) {
          return {
            ...tx,
            type: newRecord.type as Transaction['type'],
            amount: newRecord.amount,
            status: newRecord.status || 'success',
            name: newRecord.name,
            avatar_url: newRecord.avatar_url,
            description: `Transaction for ${newRecord.name}`,
          };
        }
        return tx;
      });
    } else if (eventType === 'DELETE' && oldRecord) {
      updatedTransactions = currentTransactions.filter(tx => 
        tx.id !== oldRecord.id
      );
    }
    
    setTransactions(updatedTransactions);
    calculateStats();
    filterTransactions();
  }, [transactions, toast, calculateStats, filterTransactions, activeSfdId]);
  
  // Subscribe to realtime updates
  useRealtimeSubscription({
    activeSfdId,
    onUpdate: handleRealtimeUpdate
  });
  
  // Load initial data
  const refreshTransactions = useCallback(async () => {
    const { transactions: fetchedTransactions } = await fetchTransactions();
    setTransactions(fetchedTransactions);
    calculateStats();
    filterTransactions();
  }, [fetchTransactions, calculateStats, filterTransactions]);
  
  // Load initial data on mount
  useEffect(() => {
    if (user && activeSfdId) {
      refreshTransactions();
    }
  }, [user, activeSfdId, refreshTransactions]);
  
  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    isLoading,
    stats,
    filterTransactions,
    refreshTransactions
  };
}
