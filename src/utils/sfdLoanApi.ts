
import { supabase } from '@/integrations/supabase/client';

export const sfdLoanApi = {
  // Create a new loan
  async createLoan(loanData: any, userId: string) {
    try {
      // Add created_by information
      const loanWithMeta = {
        ...loanData,
        created_by: userId,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('sfd_loans')
        .insert(loanWithMeta)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating loan:', error);
      throw new Error(error.message || 'Failed to create loan');
    }
  },

  // Approve an existing loan
  async approveLoan(loanId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error approving loan:', error);
      throw new Error(error.message || 'Failed to approve loan');
    }
  },

  // Reject a loan
  async rejectLoan(loanId: string, userId: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          rejection_reason: reason || 'No reason provided'
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error rejecting loan:', error);
      throw new Error(error.message || 'Failed to reject loan');
    }
  },

  // Disburse an approved loan
  async disburseLoan(loanId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'disbursed',
          disbursed_at: new Date().toISOString(),
          disbursed_by: userId,
          disbursement_status: 'completed',
          disbursement_date: new Date().toISOString(),
          disbursement_reference: `DISB-${Date.now()}`
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error disbursing loan:', error);
      throw new Error(error.message || 'Failed to disburse loan');
    }
  },

  // Record a payment for a loan
  async recordLoanPayment(loanId: string, amount: number, paymentMethod: string, userId: string) {
    try {
      // First create the payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('sfd_loan_payments')
        .insert({
          loan_id: loanId,
          amount,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          recorded_by: userId,
          status: 'completed',
          reference: `PAY-${Date.now()}`
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      
      // Then update the loan's total paid amount
      const { data: loanData, error: loanError } = await supabase
        .rpc('update_loan_payment_total', {
          p_loan_id: loanId,
          p_amount: amount
        });

      if (loanError) throw loanError;
      
      return paymentData;
    } catch (error: any) {
      console.error('Error recording payment:', error);
      throw new Error(error.message || 'Failed to record payment');
    }
  },

  // Send payment reminder
  async sendPaymentReminder(loanId: string) {
    try {
      // Get the loan details to include in the reminder
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select(`
          id, 
          client_id, 
          amount, 
          next_payment_date,
          monthly_payment,
          clients:client_id (
            full_name,
            phone,
            email
          )
        `)
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;

      // Log the reminder request
      const { data, error } = await supabase
        .from('sfd_payment_reminders')
        .insert({
          loan_id: loanId,
          client_id: loan.client_id,
          reminder_type: 'sms',
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // In a real implementation, this would actually send an SMS or email
      console.log(`Payment reminder sent for loan ${loanId}`);
      
      return data;
    } catch (error: any) {
      console.error('Error sending payment reminder:', error);
      throw new Error(error.message || 'Failed to send payment reminder');
    }
  },

  // Get all SFD loans
  async getSfdLoans() {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching loans:', error);
      throw new Error(error.message || 'Failed to fetch loans');
    }
  },

  // Fetch a single loan by ID
  async fetchLoanById(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          clients:client_id (full_name, email, phone)
        `)
        .eq('id', loanId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching loan:', error);
      throw new Error(error.message || 'Failed to fetch loan details');
    }
  }
};

// Add loan service for compatibility
export const loanService = sfdLoanApi;

// Add loanPlanService for compatibility
export const loanPlanService = {
  fetchAllLoanPlans: async () => {
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      throw new Error('Failed to fetch loan plans');
    }
  }
};
