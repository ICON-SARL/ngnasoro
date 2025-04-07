
import { supabase } from "@/integrations/supabase/client";

// Services for sending notifications related to loans
export const loanNotificationService = {
  // Send a payment reminder to the client
  async sendPaymentReminder(loanId: string) {
    try {
      // Get the loan details first
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Call the webhook function to send the notification
      const { data, error } = await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: loan.status,
          event: 'payment_reminder'
        }
      });
      
      if (error) throw error;
      
      // Add an activity entry for the reminder
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_reminder_sent',
          description: 'Rappel de paiement envoyé au client'
        });
        
      return data;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  },
  
  // Confirm payment received and notify the client
  async confirmPaymentReceived(loanId: string, paymentId: string) {
    try {
      // Call the webhook function
      const { data, error } = await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          paymentId,
          event: 'payment_received'
        }
      });
      
      if (error) throw error;
      
      // Add an activity entry
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_received',
          description: 'Paiement reçu et confirmé'
        });
        
      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
};
