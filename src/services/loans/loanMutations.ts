
import { supabase } from '@/integrations/supabase/client';
import { Loan, CreateLoanInput } from '@/types/sfdClients';

/**
 * Creates a new loan
 */
export const createLoan = async (loanData: CreateLoanInput): Promise<Loan | null> => {
  try {
    const { data, error } = await supabase
      .from('sfd_loans')
      .insert([loanData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating loan:', error);
      return null;
    }
    
    return data as Loan;
  } catch (error) {
    console.error('Error creating loan:', error);
    return null;
  }
};

/**
 * Approves a loan
 */
export const approveLoan = async (loanId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sfd_loans')
    .update({ 
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', loanId);
  
  if (error) {
    console.error('Error approving loan:', error);
    return false;
  }
  
  return true;
};

/**
 * Rejects a loan
 */
export const rejectLoan = async (loanId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sfd_loans')
    .update({ 
      status: 'rejected',
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', loanId);
  
  if (error) {
    console.error('Error rejecting loan:', error);
    return false;
  }
  
  return true;
};

/**
 * Disburses (activates) a loan
 */
export const disburseLoan = async (loanId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sfd_loans')
    .update({ 
      status: 'active',
      disbursed_at: new Date().toISOString()
    })
    .eq('id', loanId);
  
  if (error) {
    console.error('Error disbursing loan:', error);
    return false;
  }
  
  return true;
};
