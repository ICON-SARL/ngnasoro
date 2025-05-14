
import { supabase } from '@/integrations/supabase/client';
import { CreateLoanInput, Loan } from '@/types/loans';

// Helper function to calculate monthly payment
const calculateMonthlyPayment = (principal: number, interestRate: number, durationMonths: number) => {
  const monthlyRate = interestRate / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
         (Math.pow(1 + monthlyRate, durationMonths) - 1);
};

// Create a new loan
export async function createLoan(loanData: CreateLoanInput): Promise<{ success: boolean; data?: Loan; error?: string }> {
  try {
    // Calculate the monthly payment amount
    const monthlyPayment = calculateMonthlyPayment(
      loanData.amount,
      loanData.interest_rate,
      loanData.duration_months
    );

    const { data, error } = await supabase
      .from('sfd_loans')
      .insert({
        ...loanData,
        monthly_payment: monthlyPayment,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating loan:', error);
    return { success: false, error: error.message || 'Failed to create loan' };
  }
}

// Get all loans for an SFD
export async function getSfdLoans(): Promise<Loan[]> {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients(id, full_name, email, phone),
        sfds:sfd_id(id, name, logo_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the loans with reference numbers if they don't have one
    return (data || []).map(loan => ({
      ...loan,
      reference: loan.id.substring(0, 8)
    }));
  } catch (error) {
    console.error('Error fetching SFD loans:', error);
    return [];
  }
}

// Get a loan by ID
export async function fetchLoanById(loanId: string): Promise<Loan | null> {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients(id, full_name, email, phone),
        sfds:sfd_id(name, logo_url)
      `)
      .eq('id', loanId)
      .single();

    if (error) throw error;

    // Add reference if it doesn't exist
    const loan = {
      ...data,
      reference: data.id.substring(0, 8)
    };

    return loan;
  } catch (error) {
    console.error(`Error fetching loan ${loanId}:`, error);
    return null;
  }
}

// Approve a loan
export async function approveLoan(loanId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', loanId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error approving loan:', error);
    return { success: false, error: error.message };
  }
}

// Reject a loan
export async function rejectLoan(loanId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || 'Application rejected',
        processed_at: new Date().toISOString(),
        processed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', loanId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting loan:', error);
    return { success: false, error: error.message };
  }
}

// Disburse loan funds
export async function disburseLoan(loanId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentDate = new Date().toISOString();
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'active',
        disbursed_at: currentDate,
        disbursement_date: currentDate,
        disbursement_status: 'completed',
        disbursement_reference: `DISB-${Date.now().toString().substring(5)}`
      })
      .eq('id', loanId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error disbursing loan:', error);
    return { success: false, error: error.message };
  }
}

// Record a loan payment
export async function recordLoanPayment(
  loanId: string, 
  amount: number, 
  paymentMethod: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        payment_date: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error recording loan payment:', error);
    return { success: false, error: error.message };
  }
}

// Get payments for a loan
export async function getLoanPayments(loanId: string) {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching loan payments:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// Send a payment reminder
export async function sendPaymentReminder(loanId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Log the reminder in the database
    const { error } = await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'payment_reminder',
        description: 'Payment reminder sent to client',
        performed_by: (await supabase.auth.getUser()).data.user?.id,
      });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error sending payment reminder:', error);
    return { success: false, error: error.message };
  }
}
