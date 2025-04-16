
import { supabase } from '@/integrations/supabase/client';
import { Loan, CreateLoanInput } from '@/types/sfdClients';
import { calculateLoanDetails } from './loanCalculations';

export const loanService = {
  /**
   * Create a new loan application
   */
  createLoan: async (loanData: CreateLoanInput): Promise<Loan> => {
    try {
      // Calculate loan details based on plan
      const loanDetails = calculateLoanDetails(
        loanData.amount, 
        loanData.duration_months, 
        loanData.interest_rate
      );

      // Insert loan application
      const { data, error } = await supabase
        .from('sfd_loans')
        .insert({
          ...loanData,
          monthly_payment: loanDetails.monthlyPayment,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },

  /**
   * Approve a loan application
   */
  approveLoan: async (loanId: string, approverId: string): Promise<Loan> => {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approverId
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error approving loan:', error);
      throw error;
    }
  },

  /**
   * Disburse an approved loan
   */
  disburseLoan: async (loanId: string, disburserId: string): Promise<Loan> => {
    try {
      // First, check SFD account balance
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('amount, sfd_id')
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;

      const { data: account, error: accountError } = await supabase
        .from('sfd_accounts')
        .select('balance')
        .eq('sfd_id', loan.sfd_id)
        .eq('account_type', 'operation')
        .single();

      if (accountError) throw accountError;

      // Check if sufficient funds are available
      if (account.balance < loan.amount) {
        throw new Error('Insufficient funds in SFD account');
      }

      // Update loan status and create disbursement record
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          disbursement_status: 'completed'
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error disbursing loan:', error);
      throw error;
    }
  }
};
