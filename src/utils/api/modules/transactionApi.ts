
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
        query = query.eq('status', filters.status);
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
   * Report and manage transaction disputes
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
    try {
      // First create the dispute record
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError) throw txError;

      // Create dispute record
      const { data, error } = await supabase
        .from('transaction_disputes')
        .insert({
          transaction_id: transactionId,
          reason,
          description,
          evidence_urls: evidence,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update transaction status
      await supabase
        .from('transactions')
        .update({ status: 'disputed' })
        .eq('id', transactionId);

      // Create audit log
      await supabase
        .from('audit_logs')
        .insert({
          action: 'transaction_dispute_created',
          category: 'TRANSACTION_DISPUTES',
          severity: 'warning',
          status: 'success',
          details: {
            transaction_id: transactionId,
            dispute_id: data.id,
            reason
          }
        });

      return data as unknown as TransactionDispute;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Resolve a transaction dispute
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
    try {
      // Get dispute details
      const { data: existingDispute, error: getError } = await supabase
        .from('transaction_disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (getError) throw getError;

      // Update dispute status
      const { data, error } = await supabase
        .from('transaction_disputes')
        .update({
          status: resolution === 'accepted' ? 'resolved' : 'rejected',
          resolution_notes: notes,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId)
        .select()
        .single();

      if (error) throw error;

      if (resolution === 'accepted') {
        // Update transaction status
        await supabase
          .from('transactions')
          .update({ status: 'reversed' })
          .eq('id', existingDispute.transaction_id);

        // Create reversal transaction if needed
        await supabase.functions.invoke('process-transaction-reversal', {
          body: { 
            disputeId,
            transactionId: existingDispute.transaction_id
          }
        });
      }

      // Create audit log
      await supabase
        .from('audit_logs')
        .insert({
          action: 'transaction_dispute_resolved',
          category: 'TRANSACTION_DISPUTES',
          severity: 'info',
          status: 'success',
          details: {
            dispute_id: disputeId,
            resolution,
            resolved_by: resolvedBy
          }
        });

      return data as unknown as TransactionDispute;
    } catch (error) {
      handleError(error);
      return null;
    }
  }
};
