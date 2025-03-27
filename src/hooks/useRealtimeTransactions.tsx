
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
  
  // Calcule les statistiques des transactions
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
  
  // Récupère les transactions initiales
  const fetchTransactions = useCallback(async () => {
    if (!user || !activeSfdId) return;
    
    setIsLoading(true);
    
    try {
      // En production, ce serait un appel à Supabase
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // Si nous n'avons pas de données réelles dans la table, utilisons des données simulées pour la démonstration
      const txData = data && data.length > 0 ? data : generateMockTransactions(activeSfdId);
      
      setTransactions(txData);
      setFilteredTransactions(txData);
      calculateStats(txData);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les transactions. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId, toast, calculateStats]);
  
  // Configure l'abonnement en temps réel
  useEffect(() => {
    if (!user || !activeSfdId) return;
    
    fetchTransactions();
    
    // Configuration de l'abonnement en temps réel via Supabase
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
  }, [user, activeSfdId, fetchTransactions]);
  
  // Gère les mises à jour en temps réel
  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    let updatedTransactions = [...transactions];
    
    if (eventType === 'INSERT') {
      updatedTransactions = [newRecord as Transaction, ...updatedTransactions];
      toast({
        title: 'Nouvelle transaction',
        description: `${newRecord.type} de ${newRecord.amount} FCFA`,
      });
    } else if (eventType === 'UPDATE') {
      updatedTransactions = updatedTransactions.map(tx => 
        tx.id === newRecord.id ? (newRecord as Transaction) : tx
      );
    } else if (eventType === 'DELETE') {
      updatedTransactions = updatedTransactions.filter(tx => tx.id !== oldRecord.id);
    }
    
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);
    calculateStats(updatedTransactions);
  };
  
  // Filtrer les transactions
  const filterTransactions = useCallback((searchTerm: string = '', status: string | null = null) => {
    let filtered = [...transactions];
    
    // Appliquer la recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        (tx.description && tx.description.toLowerCase().includes(term)) ||
        tx.id.toLowerCase().includes(term) ||
        tx.type.toLowerCase().includes(term) ||
        (tx.payment_method && tx.payment_method.toLowerCase().includes(term))
      );
    }
    
    // Appliquer le filtre de statut
    if (status) {
      filtered = filtered.filter(tx => tx.status === status);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions]);
  
  // Génère des transactions simulées pour la démonstration
  const generateMockTransactions = (sfdId: string): Transaction[] => {
    const transactionTypes: Transaction['type'][] = ['deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement'];
    const statuses: Transaction['status'][] = ['success', 'pending', 'failed', 'flagged'];
    
    return Array.from({ length: 20 }, (_, i) => {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const status = Math.random() > 0.7 
        ? statuses[Math.floor(Math.random() * statuses.length)]
        : 'success';
      
      return {
        id: `TX${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        sfd_id: sfdId,
        type,
        amount: Math.floor(Math.random() * 9000000) + 10000, // 10K à 9M FCFA
        currency: 'FCFA',
        status,
        description: `Transaction ${type} #${i+1}`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Sur les dernières 24h
        payment_method: ['espèces', 'mobile_money', 'virement', 'chèque'][Math.floor(Math.random() * 4)],
      };
    });
  };
  
  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    isLoading,
    stats,
    filterTransactions,
    refreshTransactions: fetchTransactions
  };
}
