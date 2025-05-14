
// This file contains functions for managing loans

import { supabase } from '@/integrations/supabase/client';
import { CreateLoanInput, Loan } from '@/types/loans';

export async function createLoan(loanData: CreateLoanInput): Promise<{ success: boolean, data?: Loan, error?: string }> {
  try {
    console.log('Creating loan with data:', loanData);
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .insert({
        client_id: loanData.client_id,
        sfd_id: loanData.sfd_id,
        amount: loanData.amount,
        interest_rate: loanData.interest_rate,
        duration_months: loanData.duration_months,
        purpose: loanData.purpose,
        loan_plan_id: loanData.loan_plan_id,
        monthly_payment: loanData.monthly_payment,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating loan:', error);
      throw new Error(error.message);
    }
    
    return { 
      success: true, 
      data: data as unknown as Loan 
    };
  } catch (error: any) {
    console.error('Error in createLoan:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function getSfdLoans(sfdId: string): Promise<Loan[]> {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients (
          full_name,
          email,
          phone
        ),
        sfds (
          name,
          logo_url
        )
      `)
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as Loan[];
  } catch (error) {
    console.error('Error fetching SFD loans:', error);
    return [];
  }
}

export async function fetchLoanById(loanId: string): Promise<Loan | null> {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients (
          full_name,
          email,
          phone
        ),
        sfds (
          name,
          logo_url
        )
      `)
      .eq('id', loanId)
      .single();
    
    if (error) throw error;
    
    return data as unknown as Loan;
  } catch (error) {
    console.error('Error fetching loan by ID:', error);
    return null;
  }
}

export async function approveLoan(loanId: string, approverId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approverId
      })
      .eq('id', loanId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error approving loan:', error);
    return false;
  }
}

export async function rejectLoan(loanId: string, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', loanId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error rejecting loan:', error);
    return false;
  }
}

export async function disburseLoan(loanId: string, reference: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({
        status: 'active',
        disbursed_at: new Date().toISOString(),
        disbursement_reference: reference
      })
      .eq('id', loanId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error disbursing loan:', error);
    return false;
  }
}

export async function recordLoanPayment(loanId: string, amount: number, reference: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sfd_loan_payments')
      .insert({
        loan_id: loanId,
        amount: amount,
        payment_date: new Date().toISOString(),
        payment_reference: reference,
        status: 'confirmed'
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error recording loan payment:', error);
    return false;
  }
}

export async function getLoanPayments(loanId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('sfd_loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting loan payments:', error);
    return [];
  }
}

export async function sendPaymentReminder(loanId: string): Promise<boolean> {
  try {
    // Here we would implement the actual reminder logic
    // Could involve sending notifications, emails, or SMSs
    console.log(`Sending payment reminder for loan ${loanId}`);
    
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
}

// Additional loan-related functions can be added here
