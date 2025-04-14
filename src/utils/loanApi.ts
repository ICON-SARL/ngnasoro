
import { supabase } from '@/integrations/supabase/client';

export const loanApi = {
  // Approve a loan
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
  }
};
