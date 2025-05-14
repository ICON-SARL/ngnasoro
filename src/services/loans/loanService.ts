import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';
import { useToast } from '@/hooks/use-toast';

/**
 * Creates a new loan application
 */
export const createLoan = async (loanData: any): Promise<any> => {
  try {
    console.log("Creating loan with data:", JSON.stringify(loanData, null, 2));
    
    // Make sure required fields exist
    if (!loanData.client_id || !loanData.sfd_id || !loanData.amount || !loanData.duration_months) {
      throw new Error('Missing required loan data fields');
    }

    // Create loan directly through the database using service role
    const { data: loan, error } = await supabase.functions
      .invoke('loan-manager', {
        body: {
          action: 'create_loan',
          data: loanData
        }
      });

    if (error) {
      console.error('Error creating loan via edge function:', error);
      throw new Error(`Failed to create loan: ${error.message}`);
    }

    if (!loan) {
      throw new Error('No loan data returned from server');
    }

    console.log('Loan created successfully:', loan);
    return loan;
  } catch (error: any) {
    console.error('Error in createLoan service:', error);
    throw new Error(error.message || 'Failed to create loan application');
  }
};

/**
 * Fetches loans by their ID
 */
export const fetchLoanById = async (loanId: string): Promise<Loan | null> => {
  try {
    if (!loanId) return null;
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfds:sfd_id (
          name,
          logo_url
        ),
        sfd_clients:client_id (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', loanId)
      .single();
    
    if (error) {
      console.error('Error fetching loan:', error);
      return null;
    }
    
    return {
      ...data,
      id: data.id,
      client_name: data.sfd_clients?.full_name || 'Unknown',
      sfd_name: data.sfds?.name || 'Unknown',
    } as Loan;
  } catch (error) {
    console.error('Error in fetchLoanById:', error);
    return null;
  }
};

// Get all loans for an SFD
export const getSfdLoans = async (sfdId?: string): Promise<Loan[]> => {
  try {
    if (!sfdId) {
      const { data: { session } } = await supabase.auth.getSession();
      sfdId = session?.user?.user_metadata?.sfd_id;
      
      if (!sfdId) {
        console.error('No SFD ID provided or found in session');
        return [];
      }
    }
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfds:sfd_id (
          name,
          logo_url
        ),
        sfd_clients:client_id (
          full_name,
          email,
          phone
        )
      `)
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching SFD loans:', error);
      return [];
    }
    
    return data.map(loan => ({
      ...loan,
      client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
      sfd_name: loan.sfds?.name || 'Unknown SFD',
      reference: loan.id.substring(0, 8)
    })) as Loan[];
  } catch (error) {
    console.error('Error in getSfdLoans:', error);
    return [];
  }
};

/**
 * Get loans for a specific client
 */
export const getClientLoans = async (clientId?: string): Promise<Loan[]> => {
  if (!clientId) {
    try {
      // Get user ID from session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get client ID from user ID
      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id);
      
      if (clientsError || !clientsData?.length) {
        console.log('No client found for this user');
        return [];
      }
      
      clientId = clientsData[0].id;
    } catch (error) {
      console.error('Error getting client ID:', error);
      return [];
    }
  }
  
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        *,
        sfds:sfd_id (
          name,
          logo_url
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client loans:', error);
      return [];
    }
    
    return data.map(loan => ({
      ...loan,
      sfd_name: loan.sfds?.name || 'Unknown SFD',
      reference: loan.id.substring(0, 8)
    })) as Loan[];
  } catch (error) {
    console.error('Error in getClientLoans:', error);
    return [];
  }
};

// Approve loan
export const approveLoan = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
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
};

// Reject loan
export const rejectLoan = async (loanId: string, reason?: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: (await supabase.auth.getUser()).data.user?.id,
        rejection_reason: reason || 'Loan application rejected'
      })
      .eq('id', loanId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error rejecting loan:', error);
    throw error;
  }
};

// Disburse loan
export const disburseLoan = async (loanId: string) => {
  try {
    const { data, error } = await supabase.functions
      .invoke('loan-manager', {
        body: {
          action: 'disburse_loan',
          payload: {
            loanId,
            method: 'bank_transfer',
            disbursedBy: (await supabase.auth.getUser()).data.user?.id,
            notes: 'Disbursed via application'
          }
        }
      });
    
    if (error) {
      console.error('Error disbursing loan:', error);
      throw new Error('Failed to disburse loan');
    }
    
    return data;
  } catch (error) {
    console.error('Error in disburseLoan:', error);
    throw error;
  }
};

// Record loan payment
export const recordLoanPayment = async (loanId: string, amount: number, paymentMethod: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        status: 'completed'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

// Get loan payments history
export const getLoanPayments = async (loanId: string) => {
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
};

// Send payment reminder
export const sendPaymentReminder = async (loanId: string) => {
  try {
    // First, get the loan details to determine payment information
    const { data: loanData, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .single();
    
    if (loanError) throw loanError;
    
    if (!loanData) throw new Error('Loan not found');
    
    const now = new Date();
    const nextPaymentDate = loanData.next_payment_date ? new Date(loanData.next_payment_date) : 
      new Date(now.setMonth(now.getMonth() + 1));
    
    // Calculate reminder date (typically 3 days before payment)
    const reminderDate = new Date(nextPaymentDate);
    reminderDate.setDate(reminderDate.getDate() - 3);
    
    // Determine payment number (count of existing payments + 1)
    const { count: paymentCount, error: countError } = await supabase
      .from('loan_payments')
      .select('*', { count: 'exact', head: false })
      .eq('loan_id', loanId);
    
    if (countError) throw countError;
    
    const paymentNumber = (paymentCount || 0) + 1;
    
    // Create reminder record
    const { data, error } = await supabase
      .from('loan_payment_reminders')
      .insert({
        loan_id: loanId,
        sent_at: new Date().toISOString(),
        is_sent: true,
        payment_date: nextPaymentDate.toISOString(),
        reminder_date: reminderDate.toISOString(),
        payment_number: paymentNumber,
        amount: loanData.monthly_payment || 0,
        client_id: loanData.client_id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create an activity log
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'payment_reminder_sent',
        description: 'Payment reminder sent to client',
        performed_by: (await supabase.auth.getUser()).data.user?.id
      });
    
    return data;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    throw error;
  }
};
