
import { supabase } from "@/integrations/supabase/client";
import { Loan } from "@/types/sfdClients";

// Loan approval and status change operations
export const loanApprovalService = {
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
  }
};

// Helper function to calculate next payment date
function getNextPaymentDate(daysFromNow = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}
