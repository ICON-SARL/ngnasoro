import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Calcule les frais de retard selon les règles :
 * - 0-7 jours : 0 FCFA (période de grâce)
 * - 8-30 jours : 5% du montant dû
 * - 31+ jours : 10% du montant dû
 */
function calculateLateFee(daysOverdue: number, amountDue: number): number {
  if (daysOverdue <= 7) {
    return 0;
  } else if (daysOverdue <= 30) {
    return Math.round(amountDue * 0.05 * 100) / 100; // 5%
  } else {
    return Math.round(amountDue * 0.10 * 100) / 100; // 10%
  }
}

async function checkOverdueLoans() {
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

  console.log('Starting overdue loans check...');

  // Récupérer toutes les échéances en attente dont la date est dépassée
  const today = new Date().toISOString().split('T')[0];
  
  const { data: overdueSchedules, error } = await supabaseClient
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
          phone
        )
      )
    `)
    .eq('status', 'pending')
    .lt('due_date', today);

  if (error) {
    console.error('Error fetching overdue schedules:', error);
    throw error;
  }

  console.log(`Found ${overdueSchedules?.length || 0} overdue installments`);

  let updatedCount = 0;
  let notificationsCreated = 0;

  for (const schedule of overdueSchedules || []) {
    const dueDate = new Date(schedule.due_date);
    const todayDate = new Date(today);
    const daysOverdue = Math.floor((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const amountDue = schedule.total_amount - schedule.paid_amount;
    const lateFee = calculateLateFee(daysOverdue, amountDue);

    // Mettre à jour l'échéance
    const { error: updateError } = await supabaseClient
      .from('loan_payment_schedules')
      .update({
        status: 'overdue',
        days_overdue: daysOverdue,
        late_fee: lateFee,
        updated_at: new Date().toISOString()
      })
      .eq('id', schedule.id);

    if (updateError) {
      console.error(`Error updating schedule ${schedule.id}:`, updateError);
      continue;
    }

    updatedCount++;

    // Créer notification pour le client
    const client = schedule.sfd_loans.sfd_clients;
    const shouldNotify = daysOverdue === 1 || daysOverdue === 7 || daysOverdue === 30;
    
    if (shouldNotify && client.user_id) {
      const { error: notifError } = await supabaseClient
        .from('admin_notifications')
        .insert({
          user_id: client.user_id,
          type: 'loan_overdue',
          title: '⚠️ Échéance de prêt en retard',
          message: `Votre paiement d'échéance n°${schedule.installment_number} est en retard de ${daysOverdue} jours. Montant dû: ${amountDue.toLocaleString()} FCFA${lateFee > 0 ? ` + ${lateFee.toLocaleString()} FCFA de frais de retard` : ''}.`,
          action_url: `/mobile-flow/loan/${schedule.loan_id}/repayment`
        });

      if (!notifError) {
        notificationsCreated++;
      }
    }

    // Logger dans audit_logs pour les retards critiques (>30 jours)
    if (daysOverdue > 30) {
      await supabaseClient.from('audit_logs').insert({
        user_id: client.user_id,
        action: 'loan_severely_overdue',
        category: 'loans',
        severity: 'warn',
        status: 'completed',
        target_resource: schedule.loan_id,
        details: {
          days_overdue: daysOverdue,
          late_fee: lateFee,
          installment_number: schedule.installment_number,
          amount_due: amountDue
        }
      });
    }
  }

  console.log(`Updated ${updatedCount} overdue installments`);
  console.log(`Created ${notificationsCreated} notifications`);

  return {
    success: true,
    overdueCount: overdueSchedules?.length || 0,
    updatedCount,
    notificationsCreated
  };
}

// CRON job quotidien à 6h00
Deno.cron("Check overdue loans daily", "0 6 * * *", async () => {
  console.log('Running daily overdue loans check...');
  try {
    await checkOverdueLoans();
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
    const result = await checkOverdueLoans();

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in calculate-late-fees:', error);
    
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
