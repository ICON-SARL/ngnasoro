import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AmortizationSchedule {
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  remaining_principal: number;
}

/**
 * Génère un échéancier d'amortissement complet pour un prêt
 */
function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  durationMonths: number,
  startDate: Date
): AmortizationSchedule[] {
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) 
                        / (Math.pow(1 + monthlyRate, durationMonths) - 1);
  
  let remainingPrincipal = principal;
  const schedule: AmortizationSchedule[] = [];
  
  for (let i = 1; i <= durationMonths; i++) {
    const interestAmount = remainingPrincipal * monthlyRate;
    const principalAmount = monthlyPayment - interestAmount;
    remainingPrincipal -= principalAmount;
    
    // Calculer la date d'échéance
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    schedule.push({
      installment_number: i,
      due_date: dueDate.toISOString().split('T')[0],
      principal_amount: Math.round(principalAmount * 100) / 100,
      interest_amount: Math.round(interestAmount * 100) / 100,
      total_amount: Math.round(monthlyPayment * 100) / 100,
      remaining_principal: Math.max(0, Math.round(remainingPrincipal * 100) / 100)
    });
  }
  
  return schedule;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { loanId } = await req.json();

    if (!loanId) {
      throw new Error('loanId is required');
    }

    console.log('Generating loan schedule for loan:', loanId);

    // Récupérer les détails du prêt
    const { data: loan, error: loanError } = await supabaseClient
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      throw new Error('Loan not found');
    }

    // Vérifier que le prêt est décaissé ou actif
    if (loan.status !== 'disbursed' && loan.status !== 'active') {
      throw new Error(`Loan must be disbursed or active (current status: ${loan.status})`);
    }

    // Vérifier que disbursed_at existe
    if (!loan.disbursed_at) {
      throw new Error('Loan has not been disbursed yet. Cannot generate schedule without disbursement date.');
    }

    // Vérifier si un échéancier existe déjà
    const { data: existingSchedule } = await supabaseClient
      .from('loan_payment_schedules')
      .select('id')
      .eq('loan_id', loanId)
      .limit(1);

    if (existingSchedule && existingSchedule.length > 0) {
      console.log('Schedule already exists for loan:', loanId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Schedule already exists',
          scheduleExists: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer l'échéancier
    const startDate = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date();
    const schedule = generateAmortizationSchedule(
      loan.amount,
      loan.interest_rate,
      loan.duration_months,
      startDate
    );

    console.log('Generated schedule with', schedule.length, 'installments');

    // Insérer l'échéancier dans la base
    const scheduleRecords = schedule.map(item => ({
      loan_id: loanId,
      ...item
    }));

    const { error: insertError } = await supabaseClient
      .from('loan_payment_schedules')
      .insert(scheduleRecords);

    if (insertError) {
      console.error('Error inserting schedule:', insertError);
      throw new Error('Failed to insert schedule: ' + insertError.message);
    }

    // Logger dans audit_logs
    await supabaseClient.from('audit_logs').insert({
      user_id: loan.client_id,
      action: 'loan_schedule_generated',
      category: 'loans',
      severity: 'info',
      status: 'success',
      target_resource: loanId,
      details: {
        duration_months: loan.duration_months,
        total_installments: schedule.length,
        monthly_payment: schedule[0]?.total_amount
      }
    });

    console.log('Successfully generated and saved loan schedule');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Loan schedule generated successfully',
        schedule: schedule,
        totalInstallments: schedule.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-loan-schedule:', error);
    
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
