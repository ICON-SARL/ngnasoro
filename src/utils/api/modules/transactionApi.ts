
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
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError) throw txError;

      // Use explicit typecasting with a temporary variable to help TypeScript
      const disputeQuery = await supabase
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
      
      // Safe handling of the dispute data
      const disputeData = disputeQuery.data as TransactionDispute | null;
      const disputeError = disputeQuery.error;

      if (disputeError) throw disputeError;

      await supabase
        .from('transactions')
        .update({ status: 'disputed' })
        .eq('id', transactionId);

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          action: 'transaction_dispute_created',
          category: 'TRANSACTION_DISPUTES',
          severity: 'warning',
          status: 'success',
          details: {
            transaction_id: transactionId,
            dispute_id: disputeData ? disputeData.id : null,
            reason
          }
        });

      return disputeData;
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
      // Retrieve the existing dispute first
      const existingDisputeQuery = await supabase
        .from('transaction_disputes')
        .select('*')
        .eq('id', disputeId)
        .single();
      
      // Safe handling of the existing dispute data
      const existingDispute = existingDisputeQuery.data as TransactionDispute | null;
      const getError = existingDisputeQuery.error;

      if (getError) throw getError;
      if (!existingDispute) return null;

      // Update the dispute with resolution details
      const updatedDisputeQuery = await supabase
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
      
      // Safe handling of the updated dispute data
      const updatedDispute = updatedDisputeQuery.data as TransactionDispute | null;
      const updateError = updatedDisputeQuery.error;

      if (updateError) throw updateError;

      // If dispute is accepted, process the transaction reversal
      if (resolution === 'accepted' && existingDispute.transaction_id) {
        // Update transaction status to reversed
        await supabase
          .from('transactions')
          .update({ status: 'reversed' })
          .eq('id', existingDispute.transaction_id);

        // Invoke the edge function to process the reversal
        await supabase.functions.invoke('process-transaction-reversal', {
          body: { 
            disputeId,
            transactionId: existingDispute.transaction_id
          }
        });
      }

      // Create audit log for the resolution
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

      return updatedDispute;
    } catch (error) {
      handleError(error);
      return null;
    }
  }
};
