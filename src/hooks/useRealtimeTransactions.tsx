import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Transaction, TransactionStats } from '@/types/transactions';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define simple types for realtime events
type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

// Define a simple interface for database records to avoid deep nesting
interface SimpleDatabaseRecord {
  id: string;
  amount: number;
  name: string;
  type: string;
  user_id: string;
  sfd_id?: string;
  created_at?: string;
  date?: string;
  avatar_url?: string;
  [key: string]: any; // Allow other properties
}

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
  
  // Helper function to convert database records to Transaction objects
  const convertDatabaseRecordsToTransactions = useCallback((records: any[]): Transaction[] => {
    return records.map(record => ({
      id: record.id,
      user_id: record.user_id,
      sfd_id: record.sfd_id || activeSfdId,
      type: record.type as Transaction['type'],
      amount: record.amount,
      status: 'success', // Default to success if not specified
      created_at: record.created_at || record.date || new Date().toISOString(),
      name: record.name,
      date: record.date,
      avatar_url: record.avatar_url,
      description: `Transaction for ${record.name}`,
    }));
  }, [activeSfdId]);
  
  // Calculate statistics for transactions
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
  
  // Generate simulated transactions for demonstration
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
  
  // Fetch initial transactions
  const fetchTransactions = useCallback(async () => {
    if (!user || !activeSfdId) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      let txData: Transaction[] = [];
      
      // If we don't have real data in the table, use simulated data for demonstration
      if (data && data.length > 0) {
        // Completely avoid complex typing by using any
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
  
  // Handle realtime updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    const eventType = payload.eventType as RealtimeEventType;
    
    // Create a new array instead of mutating the old one
    let updatedTransactions = [...transactions];
    
    if (eventType === 'INSERT' && payload.new) {
      // Avoid type instantiation completely
      const newTransaction = convertDatabaseRecordsToTransactions([payload.new])[0];
      
      updatedTransactions = [newTransaction, ...updatedTransactions];
      toast({
        title: 'New transaction',
        description: `${newTransaction.type} of ${newTransaction.amount} FCFA`,
      });
    } else if (eventType === 'UPDATE' && payload.new) {
      // Avoid type instantiation completely
      const updatedTransaction = convertDatabaseRecordsToTransactions([payload.new])[0];
      
      updatedTransactions = updatedTransactions.map(tx => 
        tx.id === updatedTransaction.id ? updatedTransaction : tx
      );
    } else if (eventType === 'DELETE' && payload.old) {
      // Simple null check without complex typing
      if (payload.old && payload.old.id) {
        updatedTransactions = updatedTransactions.filter(tx => tx.id !== payload.old.id);
      }
    }
    
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);
    calculateStats(updatedTransactions);
  }, [transactions, toast, calculateStats, convertDatabaseRecordsToTransactions]);
  
  // Set up realtime subscription
  useEffect(() => {
    if (!user || !activeSfdId) return;
    
    fetchTransactions();
    
    // Configure realtime subscription via Supabase
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `sfd_id=eq.${activeSfdId}`
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeSfdId, fetchTransactions, handleRealtimeUpdate]);
  
  // Filter transactions
  const filterTransactions = useCallback((searchTerm: string = '', status: string | null = null) => {
    let filtered = [...transactions];
    
    // Apply text search
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
    
    // Apply status filter
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
