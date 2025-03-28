
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling loan notification operations
 */
export const loanNotificationService = {
  /**
   * Send a notification for a loan status change
   * @param loanId - The loan ID
   * @param status - The new status
   * @param event - Optional event type for more specific notifications
   */
  async notifyLoanStatusChange(
    loanId: string, 
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'closed', 
    event?: string
  ): Promise<any> {
    try {
      // Call the consolidated api-gateway function instead of dedicated loan-status-webhooks
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: JSON.stringify({
          path: '/loan-status-webhooks',
          loanId,
          status,
          event
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error notifying loan status change:', error);
      throw error;
    }
  },
  
  /**
   * Send a payment reminder notification
   * @param loanId - The loan ID
   */
  async sendPaymentReminder(loanId: string): Promise<any> {
    return this.notifyLoanStatusChange(loanId, 'active', 'payment_reminder');
  },
  
  /**
   * Send a payment received notification
   * @param loanId - The loan ID
   */
  async sendPaymentReceived(loanId: string): Promise<any> {
    return this.notifyLoanStatusChange(loanId, 'active', 'payment_received');
  }
};
