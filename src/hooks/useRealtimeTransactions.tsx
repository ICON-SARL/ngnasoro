import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Transaction, TransactionStats } from '@/types/transactions';

export function useRealtimeTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats>({
    totalCount: 0,
    totalVolume: 0,
    averageAmount: 0,
    successRate: 0,
    pendingCount: 0,
    flaggedCount: 0
  });
  
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  
  const convertDatabaseRecordsToTransactions = useCallback((records: any[]): Transaction[] => {
    return records.map(record => ({
      id: record.id,
      user_id: record.user_id,
      sfd_id: record.sfd_id || activeSfdId,
      type: record.type as Transaction['type'],
      amount: record.amount,
      status: record.status || 'success',
      created_at: record.created_at || record.date || new Date().toISOString(),
      name: record.name,
      date: record.date,
      avatar_url: record.avatar_url,
      description: `Transaction for ${record.name}`,
    }));
  }, [activeSfdId]);
  
  const calculateStats = useCallback((txList: Transaction[]) => {
    const totalCount = txList.length;
    const totalVolume = txList.reduce((sum, tx) => sum + tx.amount, 0);
    const averageAmount = totalCount > 0 ? totalVolume / totalCount : 0;
    const successCount = txList.filter(tx => tx.status === 'success').length;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    const pendingCount = txList.filter(tx => tx.status === 'pending').length;
    const flaggedCount = txList.filter(tx => tx.status === 'flagged').length;
    
    setStats({
      totalCount,
      totalVolume,
      averageAmount,
      successRate,
      pendingCount,
      flaggedCount
    });
  }, []);
  
  const generateMockTransactions = useCallback((sfdId: string): Transaction[] => {
    const transactionTypes: Transaction['type'][] = ['deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement'];
    const statuses: Transaction['status'][] = ['success', 'pending', 'failed', 'flagged'];
    
    const mockTransactions: Transaction[] = [];
    
    for (let i = 0; i < 20; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const status = Math.random() > 0.7 
        ? statuses[Math.floor(Math.random() * statuses.length)]
        : 'success';
      
      mockTransactions.push({
        id: `TX${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        sfd_id: sfdId,
        type,
        amount: Math.floor(Math.random() * 9000000) + 10000, // 10K to 9M FCFA
        currency: 'FCFA',
        status,
        description: `Transaction ${type} #${i+1}`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Over the last 24h
        payment_method: ['cash', 'mobile_money', 'transfer', 'check'][Math.floor(Math.random() * 4)],
      });
    }
    
    return mockTransactions;
  }, []);
  
  const fetchTransactions = useCallback(async () => {
    if (!user || !activeSfdId) return;
    
    setIsLoading(true);
    
    try {
      const result = await supabase
        .from('transactions')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      const data = result.data;
      const error = result.error;
        
      if (error) throw error;
      
      let txData: Transaction[] = [];
      
      if (data && data.length > 0) {
        txData = convertDatabaseRecordsToTransactions(data);
      } else {
        txData = generateMockTransactions(activeSfdId);
      }
      
      setTransactions(txData);
      setFilteredTransactions(txData);
      calculateStats(txData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Loading Error',
        description: 'Unable to load transactions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId, toast, calculateStats, convertDatabaseRecordsToTransactions, generateMockTransactions]);
  
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
    setFilteredTransactions(updatedTransactions);
    calculateStats(updatedTransactions);
  }, [transactions, toast, calculateStats, activeSfdId]);
  
  function createRealtimeSubscription(sfdId: string) {
    const channel = supabase.channel('public:transactions');
    
    channel.on(
      'postgres_changes', 
      { 
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `sfd_id=eq.${sfdId}`
      },
      (payload) => handleRealtimeUpdate(payload)
    );
    
    return channel.subscribe();
  }
  
  useEffect(() => {
    if (!user || !activeSfdId) return;
    
    fetchTransactions();
    
    const subscription = createRealtimeSubscription(activeSfdId);
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user, activeSfdId, fetchTransactions]);
  
  const filterTransactions = useCallback((searchTerm: string = '', status: string | null = null) => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        (tx.description && tx.description.toLowerCase().includes(term)) ||
        tx.id.toLowerCase().includes(term) ||
        tx.type.toLowerCase().includes(term) ||
        (tx.payment_method && tx.payment_method.toLowerCase().includes(term)) ||
        (tx.name && tx.name.toLowerCase().includes(term))
      );
    }
    
    if (status) {
      filtered = filtered.filter(tx => tx.status === status);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions]);
  
  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    isLoading,
    stats,
    filterTransactions,
    refreshTransactions: fetchTransactions
  };
}
