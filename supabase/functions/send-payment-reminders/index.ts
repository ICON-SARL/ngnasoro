import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendDueReminders() {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  console.log('Starting payment reminders check...');

  const today = new Date();
  const reminderDays = [7, 3, 1]; // J-7, J-3, J-1
  let notificationsCreated = 0;

  for (const days of reminderDays) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Récupérer les échéances à la date cible
    const { data: upcomingSchedules, error } = await supabaseClient
      .from('loan_payment_schedules')
      .select(`
        *,
        sfd_loans!inner(
          id,
          client_id,
          sfd_id,
          sfd_clients!inner(
            user_id,
            full_name,
            phone,
            email
          )
        )
      `)
      .eq('status', 'pending')
      .eq('due_date', targetDateStr);

    if (error) {
      console.error(`Error fetching schedules for ${days} days:`, error);
      continue;
    }

    console.log(`Found ${upcomingSchedules?.length || 0} payments due in ${days} days`);

    for (const schedule of upcomingSchedules || []) {
      const client = schedule.sfd_loans.sfd_clients;
      
      if (!client.user_id) continue;

      let title = '';
      let urgency = 'info';

      if (days === 7) {
        title = '📅 Rappel : Prochaine échéance dans 7 jours';
        urgency = 'info';
      } else if (days === 3) {
        title = '⏰ Attention : Échéance dans 3 jours';
        urgency = 'warn';
      } else if (days === 1) {
        title = '🔔 Urgent : Échéance demain !';
        urgency = 'error';
      }

      const message = `Votre paiement d'échéance n°${schedule.installment_number} arrive à échéance le ${new Date(schedule.due_date).toLocaleDateString('fr-FR')}. Montant : ${schedule.total_amount.toLocaleString()} FCFA.`;

      // Créer notification in-app
      const { error: notifError } = await supabaseClient
        .from('admin_notifications')
        .insert({
          user_id: client.user_id,
          type: `loan_reminder_${days}d`,
          title,
          message,
          action_url: `/mobile-flow/loan/${schedule.loan_id}/repayment`
        });

      if (!notifError) {
        notificationsCreated++;
        console.log(`Notification created for ${client.full_name} (${days} days)`);
      }

      // Pour J-1, créer également un log audit
      if (days === 1) {
        await supabaseClient.from('audit_logs').insert({
          user_id: client.user_id,
          action: 'payment_reminder_sent',
          category: 'loans',
          severity: 'info',
          status: 'completed',
          target_resource: schedule.loan_id,
          details: {
            installment_number: schedule.installment_number,
            due_date: schedule.due_date,
            amount: schedule.total_amount,
            days_until_due: days
          }
        });
      }

      // TODO: Intégration SMS pour J-1 si téléphone disponible
      // if (days === 1 && client.phone) {
      //   await sendSMS(client.phone, message);
      // }
    }
  }

  console.log(`Created ${notificationsCreated} reminder notifications`);

  return {
    success: true,
    notificationsCreated
  };
}

// CRON job quotidien à 8h00
Deno.cron("Send payment reminders", "0 8 * * *", async () => {
  console.log('Running daily payment reminders...');
  try {
    await sendDueReminders();
  } catch (error) {
    console.error('Error in CRON job:', error);
  }
});

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await sendDueReminders();

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-payment-reminders:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
