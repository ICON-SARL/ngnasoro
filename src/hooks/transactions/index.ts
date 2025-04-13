
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  name: string;
  description?: string;
  created_at: string;
  user_id: string;
  status: string;
  payment_method?: string;
  reference_id?: string;
  avatar_url?: string;
  date?: string;
}

export interface TransactionFilters {
  type?: string | string[];
  startDate?: string;
  endDate?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
}

export function useTransactions(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setIsLoading(false);
      return { transactions: [], error: null };
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }

      if (filters) {
        if (filters.type) {
          if (Array.isArray(filters.type)) {
            query = query.in('type', filters.type);
          } else {
            query = query.eq('type', filters.type);
          }
        }
        
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.minAmount !== undefined) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount !== undefined) {
          query = query.lte('amount', filters.maxAmount);
        }
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      setTransactions(data || []);
      setIsLoading(false);
      return { transactions: data, error: null };
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      setIsLoading(false);
      
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer les transactions. Veuillez réessayer.",
        variant: "destructive",
      });
      
      return { transactions: [], error: err };
    }
  }, [userId, sfdId, filters, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    refetch: fetchTransactions
  };
}
