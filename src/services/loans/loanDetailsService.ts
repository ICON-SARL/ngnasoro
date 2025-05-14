
// This file contains functions to fetch and format loan details

import { supabase } from '@/integrations/supabase/client';
import { LoanDetails, LoanStatus, LoanPayment } from '@/types/loans';
import { addMonths, format, parseISO, differenceInDays } from 'date-fns';

export async function fetchLoanDetails(loanId: string): Promise<{ 
  loanDetails: LoanDetails | null, 
  loanStatus: LoanStatus | null 
}> {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_loan_plans (*),
        sfd_loan_payments (*)
      `)
      .eq('id', loanId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return { loanDetails: null, loanStatus: null };
    }
    
    // Create the loan details object
    const loanDetails: LoanDetails = {
      loanType: data.sfd_loan_plans?.name || 'Standard',
      loanPurpose: data.purpose,
      totalAmount: data.amount,
      disbursalDate: data.disbursed_at || '',
      endDate: data.disbursed_at ? 
        format(addMonths(parseISO(data.disbursed_at), data.duration_months), 'yyyy-MM-dd') :
        '',
      interestRate: data.interest_rate,
      status: data.status,
      disbursed: !!data.disbursed_at,
      withdrawn: !!data.withdrawn_at
    };
    
    // Calculate loan status
    const loanStatus: LoanStatus = calculateLoanStatus(data, data.sfd_loan_payments || []);
    
    return { loanDetails, loanStatus };
  } catch (error) {
    console.error('Error fetching loan details:', error);
    return { loanDetails: null, loanStatus: null };
  }
}

function calculateLoanStatus(loan: any, payments: any[]): LoanStatus {
  // Calculate total paid amount
  const paidAmount = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate total amount due (principal + interest)
  const totalAmount = calculateTotalAmount(loan.amount, loan.interest_rate, loan.duration_months);
  
  // Calculate remaining amount
  const remainingAmount = totalAmount - paidAmount;
  
  // Calculate progress percentage
  const progress = totalAmount > 0 ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;
  
  // Determine next payment due date
  const nextPaymentDue = calculateNextPaymentDue(loan, payments);
  
  // Calculate any late fees
  const lateFees = calculateLateFees(loan, payments, nextPaymentDue);
  
  // Format payment history
  const paymentHistory = formatPaymentHistory(payments);
  
  return {
    nextPaymentDue,
    paidAmount,
    totalAmount,
    remainingAmount,
    progress,
    lateFees,
    paymentHistory,
    disbursed: !!loan.disbursed_at,
    withdrawn: !!loan.withdrawn_at,
    status: loan.status,
    disbursement_status: loan.disbursement_status
  };
}

function calculateTotalAmount(principal: number, interestRate: number, durationMonths: number): number {
  // Simple interest calculation: P * (1 + r * t), where r is annual rate and t is in years
  const rateDecimal = interestRate / 100;
  const years = durationMonths / 12;
  return principal * (1 + rateDecimal * years);
}

function calculateNextPaymentDue(loan: any, payments: any[]): string {
  // If loan is not disbursed yet, or it's completed/rejected, no payment is due
  if (!loan.disbursed_at || ['completed', 'rejected'].includes(loan.status)) {
    return '';
  }
  
  // Calculate monthly payment date based on disbursal date
  const disbursalDate = parseISO(loan.disbursed_at);
  const monthlyPaymentDay = disbursalDate.getDate();
  
  // Find how many payments have been made
  const paymentsMade = payments.filter(p => p.status === 'confirmed').length;
  
  // Calculate next payment date (disbursalDate + (paymentsMade + 1) months)
  const nextPaymentDate = addMonths(disbursalDate, paymentsMade + 1);
  
  return format(nextPaymentDate, 'yyyy-MM-dd');
}

function calculateLateFees(loan: any, payments: any[], nextPaymentDue: string): number {
  // If no payment is due, no late fees
  if (!nextPaymentDue) {
    return 0;
  }
  
  // Check if next payment is overdue
  const today = new Date();
  const nextPaymentDate = parseISO(nextPaymentDue);
  const daysLate = differenceInDays(today, nextPaymentDate);
  
  if (daysLate <= 0) {
    return 0;
  }
  
  // Calculate late fee (simplified for this example)
  // Let's assume 0.1% per day late, capped at 5%
  const monthlyPayment = loan.monthly_payment || (loan.amount / loan.duration_months);
  const lateFeeRate = Math.min(daysLate * 0.001, 0.05);
  return monthlyPayment * lateFeeRate;
}

function formatPaymentHistory(payments: any[]): LoanPayment[] {
  return payments.map(payment => {
    // Determine payment status
    let status: 'paid' | 'pending' | 'overdue' | 'late';
    
    if (payment.status === 'confirmed') {
      status = 'paid';
    } else if (payment.status === 'pending') {
      status = 'pending';
    } else if (payment.status === 'overdue') {
      status = 'overdue';
    } else {
      status = 'late';
    }
    
    return {
      id: payment.id,
      date: payment.payment_date,
      amount: payment.amount,
      status
    };
  });
}

export default {
  fetchLoanDetails
};
