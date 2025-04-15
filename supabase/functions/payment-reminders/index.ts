
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // This function can be called on a schedule using cron
    // or manually triggered from the UI to send payment reminders
    
    // Get all pending reminders that are due to be sent today or were missed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: reminders, error: remindersError } = await supabase
      .from('loan_payment_reminders')
      .select(`
        id, 
        loan_id, 
        client_id, 
        payment_number, 
        payment_date, 
        reminder_date, 
        amount,
        sfd_loans (
          client_id,
          sfd_id
        ),
        sfd_clients (
          full_name,
          email,
          phone,
          user_id
        )
      `)
      .eq('is_sent', false)
      .lte('reminder_date', today.toISOString())
      .order('reminder_date', { ascending: true });
    
    if (remindersError) {
      throw new Error(`Error fetching reminders: ${remindersError.message}`);
    }
    
    const results = {
      processed: 0,
      failed: 0,
      details: []
    };
    
    // Process each reminder
    for (const reminder of reminders || []) {
      try {
        const paymentDate = new Date(reminder.payment_date);
        const formattedDate = paymentDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        // Create notification for the client
        const { data: notification, error: notifError } = await supabase
          .from('admin_notifications')
          .insert({
            type: 'loan_payment_reminder',
            title: 'Rappel de paiement',
            message: `Votre paiement de ${reminder.amount} FCFA pour le prêt #${reminder.loan_id.substring(0, 8)} est dû le ${formattedDate}. Veuillez préparer votre paiement.`,
            recipient_id: reminder.sfd_clients.user_id,
            recipient_role: 'client',
            action_link: `/loans/${reminder.loan_id}`
          })
          .select();
        
        if (notifError) {
          throw new Error(`Error creating notification: ${notifError.message}`);
        }
        
        // Try to send SMS notification if phone is available
        let smsResult = null;
        if (reminder.sfd_clients.phone && Deno.env.get('SMS_ENABLED') === 'true') {
          smsResult = await sendSmsNotification(
            reminder.sfd_clients.phone,
            `RAPPEL: Votre paiement de ${reminder.amount} FCFA pour le prêt est dû le ${formattedDate}.`
          );
        }
        
        // Try to send email notification if email is available
        let emailResult = null;
        if (reminder.sfd_clients.email && Deno.env.get('EMAIL_ENABLED') === 'true') {
          emailResult = await sendEmailNotification(
            reminder.sfd_clients.email,
            reminder.sfd_clients.full_name,
            `Rappel de paiement - Prêt #${reminder.loan_id.substring(0, 8)}`,
            `Votre paiement de ${reminder.amount} FCFA pour le prêt #${reminder.loan_id.substring(0, 8)} est dû le ${formattedDate}. Veuillez préparer votre paiement à temps.`
          );
        }
        
        // Mark the reminder as sent
        await supabase
          .from('loan_payment_reminders')
          .update({
            is_sent: true,
            sent_at: new Date().toISOString(),
            notification_id: notification ? notification[0].id : null,
            sms_status: smsResult?.status || 'not_sent',
            email_status: emailResult?.status || 'not_sent'
          })
          .eq('id', reminder.id);
        
        // Log the activity
        await supabase
          .from('loan_activities')
          .insert({
            loan_id: reminder.loan_id,
            activity_type: 'payment_reminder_sent',
            description: `Payment reminder sent for payment #${reminder.payment_number} of ${reminder.amount} FCFA due on ${formattedDate}`
          });
        
        results.processed++;
        results.details.push({
          reminder_id: reminder.id,
          loan_id: reminder.loan_id,
          client_name: reminder.sfd_clients.full_name,
          payment_date: reminder.payment_date,
          amount: reminder.amount,
          status: 'sent'
        });
      } catch (reminderError) {
        console.error(`Error processing reminder ID ${reminder.id}:`, reminderError);
        results.failed++;
        results.details.push({
          reminder_id: reminder.id,
          loan_id: reminder.loan_id,
          error: reminderError.message,
          status: 'failed'
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} reminders with ${results.failed} failures`,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing payment reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing payment reminders' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to send SMS notifications (implementation depends on SMS provider)
async function sendSmsNotification(phone: string, message: string) {
  // This is a placeholder function - implementation would depend on your SMS provider
  console.log(`Would send SMS to ${phone}: ${message}`);
  
  // In a real implementation, you would call your SMS provider's API here
  // For example, using Twilio, Vonage, etc.
  
  return {
    status: 'simulated',
    phone,
    message
  };
}

// Helper function to send email notifications
async function sendEmailNotification(email: string, name: string, subject: string, message: string) {
  // This is a placeholder function - implementation would depend on your email provider
  console.log(`Would send email to ${email}: ${subject}`);
  
  // In a real implementation, you would call your email provider's API here
  // For example, using SendGrid, Mailgun, etc.
  
  return {
    status: 'simulated',
    email,
    subject,
    message
  };
}
