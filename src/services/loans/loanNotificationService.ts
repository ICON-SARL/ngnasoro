
import { supabase } from "@/integrations/supabase/client";

// Notification related operations
export const loanNotificationService = {
  // Send payment reminder
  async sendPaymentReminder(loanId: string, sentBy: string) {
    try {
      // Get the loan details first
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Add reminder activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_reminder',
          description: `Rappel de paiement envoyé pour ${loan.monthly_payment} FCFA`,
          performed_by: sentBy
        });
      
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'active',
          event: 'payment_reminder'
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  }
};
