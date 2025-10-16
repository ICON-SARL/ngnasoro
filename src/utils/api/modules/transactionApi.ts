
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";
import { Transaction, TransactionDispute, TransactionFilters } from "@/types/transactions";

export const transactionApi = {
  /**
   * Get detailed transaction history with filtering and pagination
   */
  async getTransactionHistory(filters?: TransactionFilters) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          sfd_clients (
            full_name,
            phone,
            email
          )
        `);
      
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.status) {
        // Cast to any to bypass type checking for extended statuses
        query = query.eq('status', filters.status as any);
      }
      
      if (filters?.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      
      if (filters?.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      let rangeStart = 0;
      let rangeEnd = 9;
      
      if (filters?.page !== undefined && filters?.limit) {
        rangeStart = filters.page * filters.limit;
        rangeEnd = rangeStart + filters.limit - 1;
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(rangeStart, rangeEnd);

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  /**
   * Generate transaction reports and statistics
   */
  async generateTransactionReport(sfdId: string, period: 'day' | 'week' | 'month' | 'year') {
    try {
      const { data, error } = await supabase.functions.invoke('generate-financial-report', {
        body: { 
          sfdId,
          period,
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Report transaction disputes - Feature not yet implemented
   * Note: transaction_disputes table does not exist in current schema
   */
  async reportTransactionDispute({
    transactionId,
    reason,
    description,
    evidence
  }: {
    transactionId: string;
    reason: string;
    description: string;
    evidence?: string[];
  }): Promise<TransactionDispute | null> {
    console.warn('Transaction disputes feature not yet implemented');
    return null;
  },

  /**
   * Resolve transaction disputes - Feature not yet implemented
   * Note: transaction_disputes table does not exist in current schema
   */
  async resolveTransactionDispute({
    disputeId,
    resolution,
    notes,
    resolvedBy
  }: {
    disputeId: string;
    resolution: 'accepted' | 'rejected';
    notes: string;
    resolvedBy: string;
  }): Promise<TransactionDispute | null> {
    console.warn('Transaction disputes feature not yet implemented');
    return null;
  }
};
