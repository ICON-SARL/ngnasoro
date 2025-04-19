
import { supabase } from '@/integrations/supabase/client';
import { Loan, CreateLoanInput } from '@/types/sfdClients';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

/**
 * Creates a new loan
 */
export const createLoan = async (loanData: CreateLoanInput): Promise<Loan | null> => {
  try {
    // Ensure we're inserting a single object, not an array
    const { data, error } = await supabase
      .from('sfd_loans')
      .insert({
        client_id: loanData.client_id,
        sfd_id: loanData.sfd_id,
        amount: loanData.amount,
        interest_rate: loanData.interest_rate,
        duration_months: loanData.duration_months,
        purpose: loanData.purpose,
        repayment_frequency: loanData.repayment_frequency,
        monthly_payment: loanData.monthly_payment,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating loan:', error);
      return null;
    }
    
    // Log loan creation
    await logAuditEvent({
      action: "loan_created",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      user_id: data.client_id,
      target_resource: `loan:${data.id}`,
      details: { 
        loan_id: data.id, 
        client_id: data.client_id,
        sfd_id: data.sfd_id, 
        amount: data.amount 
      }
    });
    
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
  try {
    // Get loan details first
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('client_id, amount, sfd_id')
      .eq('id', loanId)
      .single();
    
    if (loanError || !loan) {
      console.error('Error fetching loan for approval:', loanError);
      return false;
    }
    
    // Start a transaction - this is simulated since we don't have real transactions
    // 1. Update loan status
    const { error: updateError } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', loanId);
    
    if (updateError) {
      console.error('Error approving loan:', updateError);
      return false;
    }
    
    // 2. Create client notification
    await supabase.from('admin_notifications').insert({
      title: 'Prêt approuvé',
      message: `Votre demande de prêt de ${loan.amount} FCFA a été approuvée.`,
      type: 'loan_approval',
      recipient_id: loan.client_id,
      sender_id: userId,
      action_link: `/loans/${loanId}`
    });
    
    // 3. Log audit event
    await logAuditEvent({
      action: "loan_approved",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      user_id: userId,
      target_resource: `loan:${loanId}`,
      details: { 
        loan_id: loanId, 
        client_id: loan.client_id,
        sfd_id: loan.sfd_id,
        amount: loan.amount
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error in loan approval process:', error);
    return false;
  }
};

/**
 * Rejects a loan
 */
export const rejectLoan = async (loanId: string, userId: string, reason?: string): Promise<boolean> => {
  try {
    // Get loan details first
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('client_id, amount, sfd_id')
      .eq('id', loanId)
      .single();
    
    if (loanError || !loan) {
      console.error('Error fetching loan for rejection:', loanError);
      return false;
    }
    
    // Update loan status
    const { error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'rejected',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason || 'Demande rejetée'
      })
      .eq('id', loanId);
    
    if (error) {
      console.error('Error rejecting loan:', error);
      return false;
    }
    
    // Create client notification
    await supabase.from('admin_notifications').insert({
      title: 'Prêt rejeté',
      message: `Votre demande de prêt de ${loan.amount} FCFA a été rejetée. ${reason ? `Raison: ${reason}` : ''}`,
      type: 'loan_rejection',
      recipient_id: loan.client_id,
      sender_id: userId,
      action_link: `/loans/${loanId}`
    });
    
    // Log audit event
    await logAuditEvent({
      action: "loan_rejected",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      user_id: userId,
      target_resource: `loan:${loanId}`,
      details: { 
        loan_id: loanId, 
        client_id: loan.client_id,
        sfd_id: loan.sfd_id,
        amount: loan.amount,
        rejection_reason: reason
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error in loan rejection process:', error);
    return false;
  }
};

/**
 * Disburses (activates) a loan
 */
export const disburseLoan = async (loanId: string, userId: string): Promise<boolean> => {
  try {
    // Get loan details first
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('client_id, amount, sfd_id, status')
      .eq('id', loanId)
      .single();
    
    if (loanError || !loan) {
      console.error('Error fetching loan for disbursement:', loanError);
      return false;
    }
    
    if (loan.status !== 'approved') {
      console.error('Cannot disburse loan that is not approved');
      return false;
    }
    
    // 1. Update loan status
    const { error: updateError } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'active',
        disbursed_at: new Date().toISOString(),
        next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .eq('id', loanId);
    
    if (updateError) {
      console.error('Error updating loan status for disbursement:', updateError);
      return false;
    }
    
    // 2. Create transaction to credit client account
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: loan.client_id,
        sfd_id: loan.sfd_id,
        type: 'loan_disbursement',
        amount: loan.amount,
        name: 'Décaissement de prêt',
        description: `Décaissement du prêt ${loanId.substring(0, 8)}`,
        status: 'success',
        reference_id: loanId
      });
    
    if (transactionError) {
      console.error('Error creating disbursement transaction:', transactionError);
      return false;
    }
    
    // 3. Create client notification
    await supabase.from('admin_notifications').insert({
      title: 'Prêt décaissé',
      message: `Votre prêt de ${loan.amount} FCFA a été décaissé et crédité sur votre compte.`,
      type: 'loan_disbursement',
      recipient_id: loan.client_id,
      sender_id: userId,
      action_link: `/loans/${loanId}`
    });
    
    // 4. Log audit event
    await logAuditEvent({
      action: "loan_disbursed",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      user_id: userId,
      target_resource: `loan:${loanId}`,
      details: { 
        loan_id: loanId, 
        client_id: loan.client_id,
        sfd_id: loan.sfd_id,
        amount: loan.amount 
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error in loan disbursement process:', error);
    return false;
  }
};

export const loanService = {
  /**
   * Check loan payment status and send reminders if needed
   */
  async checkLoanPaymentStatus(loanId: string): Promise<boolean> {
    try {
      await supabase.functions.invoke('loan-reminders', {
        body: { loanId }
      });
      return true;
    } catch (error) {
      console.error('Error checking loan payment status:', error);
      return false;
    }
  },

  /**
   * Schedule automatic payment reminder
   */
  async schedulePaymentReminder(loanId: string, reminderDate: string): Promise<boolean> {
    try {
      // Get user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return false;
      }
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'payment_reminder_scheduled',
          recipient_id: user.id,
          sender_id: user.id,
          title: 'Rappel de paiement programmé',
          message: `Un rappel a été programmé pour le ${new Date(reminderDate).toLocaleDateString()}`,
          action_link: `/loans/${loanId}`
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error scheduling payment reminder:', error);
      return false;
    }
  }
};
