
import { supabase } from "@/integrations/supabase/client";
import { Loan, LoanPayment } from "@/types/sfdClients";

// SFD Loan Management API functions
export const sfdLoanApi = {
  // Get loans for current SFD
  async getSfdLoans() {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Loan[];
    } catch (error) {
      console.error('Error fetching SFD loans:', error);
      return [];
    }
  },
  
  // Get loan by ID
  async getLoanById(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (error) throw error;
      return data as Loan;
    } catch (error) {
      console.error('Error fetching loan details:', error);
      return null;
    }
  },
  
  // Create new loan
  async createLoan(loan: {
    client_id: string;
    amount: number;
    duration_months: number;
    interest_rate: number;
    purpose: string;
    subsidy_amount?: number;
  }) {
    try {
      // First get the client to fetch the SFD ID
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('sfd_id')
        .eq('id', loan.client_id)
        .single();
      
      if (clientError) throw clientError;
      
      // Calculate monthly payment using formula
      const monthlyInterest = loan.interest_rate / 100 / 12;
      const monthlyPayment = 
        (loan.amount * monthlyInterest * Math.pow(1 + monthlyInterest, loan.duration_months)) / 
        (Math.pow(1 + monthlyInterest, loan.duration_months) - 1);
      
      const { data, error } = await supabase
        .from('sfd_loans')
        .insert({
          client_id: loan.client_id,
          sfd_id: clientData.sfd_id,
          amount: loan.amount,
          duration_months: loan.duration_months,
          interest_rate: loan.interest_rate,
          status: 'pending',
          purpose: loan.purpose,
          monthly_payment: Math.round(monthlyPayment * 100) / 100,
          subsidy_amount: loan.subsidy_amount || 0,
          subsidy_rate: loan.subsidy_amount ? (loan.subsidy_amount / loan.amount) * 100 : 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add activity record
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: data.id,
          activity_type: 'loan_created',
          description: `Nouveau prêt créé pour un montant de ${loan.amount} FCFA`
        });
        
      return data as Loan;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },
  
  // Approve loan
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
      
      // Add activity record
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_approved',
          description: 'Prêt approuvé',
          performed_by: approvedBy
        });
        
      return data as Loan;
    } catch (error) {
      console.error('Error approving loan:', error);
      throw error;
    }
  },
  
  // Reject loan
  async rejectLoan(loanId: string, rejectedBy: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(), // Using same field, just to track when the decision was made
          approved_by: rejectedBy
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add activity record
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_rejected',
          description: 'Prêt rejeté',
          performed_by: rejectedBy
        });
        
      return data as Loan;
    } catch (error) {
      console.error('Error rejecting loan:', error);
      throw error;
    }
  },
  
  // Disburse loan
  async disburseLoan(loanId: string, disbursedBy: string) {
    try {
      // First get the loan details
      const { data: loanData, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Calculate next payment date (1 month from now)
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      // Update loan status
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          next_payment_date: nextPaymentDate.toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Record activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_disbursed',
          description: `Prêt décaissé pour un montant de ${loanData.amount} FCFA`,
          performed_by: disbursedBy
        });
        
      // If there's a subsidy, update the subsidy usage in the SFD subsidies table
      if (loanData.subsidy_amount && loanData.subsidy_amount > 0) {
        const { error: subsidyError } = await supabase.rpc('update_subsidy_usage', { 
          p_sfd_id: loanData.sfd_id,
          p_amount: loanData.subsidy_amount
        });
        
        if (subsidyError) {
          console.error('Error updating subsidy:', subsidyError);
          // Don't throw here, we still want to disburse the loan
        }
      }
        
      return data as Loan;
    } catch (error) {
      console.error('Error disbursing loan:', error);
      throw error;
    }
  },
  
  // Record loan payment
  async recordLoanPayment(loanId: string, amount: number, paymentMethod: string, recordedBy: string) {
    try {
      // Get the loan first
      const { data: loanData, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Create payment record
      const { data, error } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loanId,
          amount: amount,
          payment_method: paymentMethod,
          status: 'completed',
          payment_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Calculate next payment date (1 month from last payment date)
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      // Update the loan last payment and next payment dates
      await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: new Date().toISOString(),
          next_payment_date: nextPaymentDate.toISOString()
        })
        .eq('id', loanId);
      
      // Record activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_received',
          description: `Paiement reçu pour un montant de ${amount} FCFA via ${paymentMethod}`,
          performed_by: recordedBy
        });
        
      return data as LoanPayment;
    } catch (error) {
      console.error('Error recording loan payment:', error);
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
      return data as LoanPayment[];
    } catch (error) {
      console.error('Error fetching loan payments:', error);
      return [];
    }
  }
};
