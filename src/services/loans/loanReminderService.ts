
import { supabase } from '@/integrations/supabase/client';

export const loanReminderService = {
  /**
   * Schedule payment reminders for a loan
   */
  scheduleReminders: async (loanId: string) => {
    try {
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;

      // Generate reminders for each payment
      const reminders = Array.from({ length: loan.duration_months }, (_, index) => {
        const paymentDate = new Date(loan.disbursed_at);
        paymentDate.setMonth(paymentDate.getMonth() + index + 1);

        const reminderDate = new Date(paymentDate);
        reminderDate.setDate(reminderDate.getDate() - 5); // Reminder 5 days before payment

        return {
          loan_id: loanId,
          client_id: loan.client_id,
          payment_number: index + 1,
          payment_date: paymentDate.toISOString(),
          reminder_date: reminderDate.toISOString(),
          amount: loan.monthly_payment,
          is_sent: false
        };
      });

      // Bulk insert reminders
      const { error: reminderError } = await supabase
        .from('loan_payment_reminders')
        .insert(reminders);

      if (reminderError) throw reminderError;

      return true;
    } catch (error) {
      console.error('Error scheduling loan reminders:', error);
      throw error;
    }
  },

  /**
   * Send payment reminders (typically called by a scheduled job)
   */
  sendPendingReminders: async () => {
    try {
      const currentDate = new Date();

      // Fetch pending reminders due in the next 5 days
      const { data: reminders, error } = await supabase
        .from('loan_payment_reminders')
        .select(`
          id, 
          loan_id, 
          client_id, 
          payment_date, 
          amount,
          sfd_clients!inner(phone, email)
        `)
        .eq('is_sent', false)
        .lte('reminder_date', currentDate.toISOString());

      if (error) throw error;

      // Process each reminder (in a real-world scenario, you'd use SMS/Email services)
      for (const reminder of reminders) {
        // Placeholder for SMS/Email notification logic
        console.log(`Reminder for loan ${reminder.loan_id}: Payment of ${reminder.amount} due on ${reminder.payment_date}`);

        // Mark as sent
        await supabase
          .from('loan_payment_reminders')
          .update({ is_sent: true, sent_at: currentDate.toISOString() })
          .eq('id', reminder.id);
      }

      return reminders.length;
    } catch (error) {
      console.error('Error sending loan payment reminders:', error);
      throw error;
    }
  }
};
