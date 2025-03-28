
import { supabase } from "@/integrations/supabase/client";
import { Loan, LoanPayment } from "@/types/sfdClients";
import { useAuth } from "@/hooks/useAuth";

// SFD Loan Management API functions
export const sfdLoanApi = {
  // Get all loans for the current SFD user
  async getSfdLoans() {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as Loan[];
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  },
  
  // Get a specific loan by ID
  async getLoanById(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (error) throw error;
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error fetching loan details:', error);
      return null;
    }
  },
  
  // Create a new loan
  async createLoan(loanData: {
    client_id: string;
    sfd_id: string;
    amount: number;
    duration_months: number;
    interest_rate: number;
    purpose: string;
    monthly_payment: number;
    subsidy_amount?: number;
    subsidy_rate?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .insert({
          client_id: loanData.client_id,
          sfd_id: loanData.sfd_id,
          amount: loanData.amount,
          duration_months: loanData.duration_months,
          interest_rate: loanData.interest_rate,
          purpose: loanData.purpose,
          monthly_payment: loanData.monthly_payment,
          status: 'pending',
          subsidy_amount: loanData.subsidy_amount || 0,
          subsidy_rate: loanData.subsidy_rate || 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan creation activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: data.id,
          activity_type: 'loan_created',
          description: `Prêt de ${loanData.amount} FCFA créé pour le client`
        });
        
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },
  
  // Approve a loan
  async approveLoan(loanId: string, approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan approval activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_approved',
          description: 'Prêt approuvé par un agent SFD',
          performed_by: approvedBy
        });
        
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'approved'
        }
      });
        
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error approving loan:', error);
      throw error;
    }
  },
  
  // Reject a loan
  async rejectLoan(loanId: string, rejectedBy: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'rejected'
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan rejection activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_rejected',
          description: 'Prêt rejeté par un agent SFD',
          performed_by: rejectedBy
        });
        
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'rejected'
        }
      });
        
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error rejecting loan:', error);
      throw error;
    }
  },
  
  // Disburse a loan - this will also apply any subsidy
  async disburseLoan(loanId: string, disbursedBy: string) {
    try {
      // First get the loan to check if it has a subsidy
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Apply subsidy if needed
      if (loan.subsidy_amount > 0) {
        // Call the RPC function to update subsidy usage
        const { error: rpcError } = await supabase
          .rpc('update_subsidy_usage', {
            p_sfd_id: loan.sfd_id,
            p_amount: loan.subsidy_amount
          });
          
        if (rpcError) throw rpcError;
      }
      
      // Update the loan to disbursed status
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          next_payment_date: getNextPaymentDate()
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan disbursement activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_disbursed',
          description: 'Prêt décaissé et fonds transférés au client',
          performed_by: disbursedBy
        });
        
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'active',
          event: 'disbursed'
        }
      });
        
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error disbursing loan:', error);
      throw error;
    }
  },
  
  // Record a loan payment
  async recordLoanPayment(loanId: string, amount: number, paymentMethod: string, recordedBy: string) {
    try {
      // Create the payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loanId,
          amount: amount,
          payment_method: paymentMethod,
          status: 'completed'
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
      // Update the loan to reflect the payment
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: new Date().toISOString(),
          next_payment_date: getNextPaymentDate(30) // Set next payment 30 days from now
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan payment activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_recorded',
          description: `Paiement de ${amount} FCFA enregistré`,
          performed_by: recordedBy
        });
        
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'active',
          event: 'payment_received'
        }
      });
        
      return paymentData as unknown as LoanPayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },
  
  // Send payment reminder
  async sendPaymentReminder(loanId: string, sentBy: string) {
    try {
      // Get the loan details first
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Add reminder activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_reminder',
          description: `Rappel de paiement envoyé pour ${loan.monthly_payment} FCFA`,
          performed_by: sentBy
        });
      
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'active',
          event: 'payment_reminder'
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  },
  
  // Get loan payments
  async getLoanPayments(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      return data as unknown as LoanPayment[];
    } catch (error) {
      console.error('Error fetching loan payments:', error);
      return [];
    }
  }
};

// Helper function to calculate next payment date
function getNextPaymentDate(daysFromNow = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}
