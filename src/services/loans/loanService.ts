
import { supabase } from '@/integrations/supabase/client';
import { Loan, LoanApplication, CreateLoanInput } from '@/types/sfdClients';

// Create a new loan application
export async function createLoan(loanData: CreateLoanInput): Promise<Loan> {
  console.log('Creating loan with data:', loanData);
  
  try {
    // Calculate monthly payment if not provided
    if (!loanData.monthly_payment) {
      const monthlyInterestRate = loanData.interest_rate / 100 / 12;
      const totalPayments = loanData.duration_months;
      const principal = loanData.amount;
      
      const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
        
      loanData.monthly_payment = Math.round(monthlyPayment * 100) / 100;
    }
    
    // Use the loan manager edge function to create the loan
    const { data, error } = await supabase.functions.invoke('loan-manager', {
      body: {
        action: 'create_loan',
        data: loanData
      }
    });
    
    if (error) {
      console.error('Error creating loan:', error);
      throw new Error(error.message || 'Failed to create loan');
    }
    
    if (!data) {
      throw new Error('No data returned from loan creation');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in createLoan:', error);
    throw new Error(`Failed to create loan: ${error.message}`);
  }
}

// Get all SFD loans
export async function getSfdLoans(): Promise<Loan[]> {
  try {
    // Get SFD ID from user metadata
    const { data: { session } } = await supabase.auth.getSession();
    const sfdId = session?.user?.user_metadata?.sfd_id;
    
    if (!sfdId) {
      console.warn('No SFD ID found for user');
      return [];
    }
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients(full_name, email, phone),
        sfds:sfd_id(name, logo_url)
      `)
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching SFD loans:', error);
      throw error;
    }
    
    // Format loans with client names
    return (data || []).map(loan => ({
      ...loan,
      client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
      reference: loan.reference || loan.id.substring(0, 8)
    }));
  } catch (error) {
    console.error('Error in getSfdLoans:', error);
    return [];
  }
}

// Fetch loan by ID
export async function fetchLoanById(loanId: string): Promise<Loan | null> {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfd_clients(full_name, email, phone),
        sfds:sfd_id(name, logo_url)
      `)
      .eq('id', loanId)
      .single();
    
    if (error) {
      console.error('Error fetching loan by ID:', error);
      throw error;
    }
    
    return data ? {
      ...data,
      client_name: data.sfd_clients?.full_name || 'Unknown Client'
    } : null;
  } catch (error) {
    console.error('Error in fetchLoanById:', error);
    return null;
  }
}

// Approve a loan
export async function approveLoan(loanId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getSession()).data.session?.user?.id
      })
      .eq('id', loanId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error approving loan:', error);
    throw error;
  }
}

// Reject a loan
export async function rejectLoan(loanId: string, rejectionReason?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'rejected',
        rejection_reason: rejectionReason || 'Application rejected'
      })
      .eq('id', loanId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error rejecting loan:', error);
    throw error;
  }
}

// Disburse a loan
export async function disburseLoan(loanId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'disbursed',
        disbursed_at: new Date().toISOString(),
        disbursement_status: 'completed'
      })
      .eq('id', loanId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error disbursing loan:', error);
    throw error;
  }
}

// Record a loan payment
export async function recordLoanPayment(loanId: string, amount: number, paymentMethod: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        status: 'completed'
      });
    
    if (error) throw error;
    
    // Update the loan's last payment date
    await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: new Date().toISOString(),
        // Add one month to the last payment date for the next payment
        next_payment_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      })
      .eq('id', loanId);
    
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

// Get loan payments
export async function getLoanPayments(loanId: string) {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
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

// Send payment reminder
export async function sendPaymentReminder(loanId: string): Promise<void> {
  try {
    // This would typically integrate with a notification service
    console.log('Sending payment reminder for loan:', loanId);
    
    // Record that a reminder was sent
    const { error } = await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'payment_reminder',
        description: 'Payment reminder sent to client',
        performed_by: (await supabase.auth.getSession()).data.session?.user?.id
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    throw error;
  }
}

export async function submitMobileLoanApplication(application: LoanApplication): Promise<{ success: boolean; loanId?: string; error?: string }> {
  try {
    // First, get client information
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Get client ID for the specific SFD
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('id')
      .eq('user_id', userId)
      .eq('sfd_id', application.sfd_id)
      .single();
    
    if (clientError || !clientData) {
      console.error('Error finding client:', clientError);
      return { 
        success: false, 
        error: 'Vous n\'êtes pas client de cette SFD. Veuillez d\'abord soumettre une demande d\'adhésion.'
      };
    }
    
    // Create loan via edge function
    const { data, error } = await supabase.functions.invoke('loan-manager', {
      body: {
        action: 'create_loan',
        data: {
          client_id: clientData.id,
          sfd_id: application.sfd_id,
          amount: application.amount,
          duration_months: application.duration_months,
          purpose: application.purpose,
          interest_rate: application.interest_rate || 5.5,
          status: 'pending'
        }
      }
    });
    
    if (error || !data) {
      console.error('Error creating loan via function:', error);
      return { success: false, error: error?.message || 'Error creating loan' };
    }
    
    // If there are supporting documents, upload them
    if (application.supporting_documents?.length) {
      // This would be handled by another function to upload files
      console.log('Supporting documents would be uploaded here');
    }
    
    return { 
      success: true, 
      loanId: data.id 
    };
  } catch (error: any) {
    console.error('Error submitting mobile loan application:', error);
    return { success: false, error: error?.message || 'Unknown error occurred' };
  }
}
