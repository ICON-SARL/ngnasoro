import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { amount, loanPlanId, purpose, collaterals } = await req.json();

    console.log('Loan application started:', { userId: user.id, amount, loanPlanId });

    // Vérifier que l'utilisateur est un client
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('*, sfd:sfds(*)')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      throw new Error('User is not a valid client');
    }

    // Récupérer le plan de prêt
    const { data: loanPlan, error: planError } = await supabase
      .from('sfd_loan_plans')
      .select('*')
      .eq('id', loanPlanId)
      .eq('is_active', true)
      .single();

    if (planError || !loanPlan) {
      throw new Error('Invalid or inactive loan plan');
    }

    // Vérifications métier
    if (amount < loanPlan.min_amount || amount > loanPlan.max_amount) {
      throw new Error(`Loan amount must be between ${loanPlan.min_amount} and ${loanPlan.max_amount} FCFA`);
    }

    // Vérifier le niveau KYC
    const { data: kycLevel } = await supabase
      .from('kyc_levels')
      .select('*')
      .eq('level', client.kyc_level || 1)
      .single();

    if (kycLevel && amount > kycLevel.max_loan_amount) {
      throw new Error(`Your KYC level (${client.kyc_level}) allows maximum ${kycLevel.max_loan_amount} FCFA. Please upgrade your KYC.`);
    }

    // Vérifier qu'il n'y a pas de prêt actif en retard
    const { data: activeLoans } = await supabase
      .from('sfd_loans')
      .select('*, loan_penalties(*)')
      .eq('client_id', client.id)
      .in('status', ['pending', 'approved', 'active']);

    const hasOverdueLoans = activeLoans?.some(loan => 
      loan.loan_penalties?.some((p: any) => !p.waived && p.days_overdue > 30)
    );

    if (hasOverdueLoans) {
      throw new Error('You have overdue loans. Please clear penalties before applying for a new loan.');
    }

    // Calculer les montants
    const totalAmount = amount * (1 + loanPlan.interest_rate);
    const monthlyPayment = totalAmount / loanPlan.duration_months;

    // Créer le prêt
    const { data: newLoan, error: loanError } = await supabase
      .from('sfd_loans')
      .insert({
        sfd_id: client.sfd_id,
        client_id: client.id,
        loan_plan_id: loanPlanId,
        amount,
        interest_rate: loanPlan.interest_rate,
        duration_months: loanPlan.duration_months,
        total_amount: totalAmount,
        remaining_amount: totalAmount,
        monthly_payment: monthlyPayment,
        purpose,
        status: 'pending'
      })
      .select()
      .single();

    if (loanError) {
      console.error('Error creating loan:', loanError);
      throw new Error('Failed to create loan application');
    }

    // Ajouter les garanties si fournies
    if (collaterals && collaterals.length > 0) {
      const collateralRecords = collaterals.map((c: any) => ({
        loan_id: newLoan.id,
        collateral_type: c.type,
        description: c.description,
        estimated_value: c.value,
        document_url: c.documentUrl
      }));

      await supabase.from('loan_collaterals').insert(collateralRecords);
    }

    // Logger l'activité
    await supabase.from('loan_activities').insert({
      loan_id: newLoan.id,
      activity_type: 'loan_application_submitted',
      description: `Loan application for ${amount} FCFA submitted`,
      performed_by: user.id
    });

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'loan_application',
      category: 'LOAN',
      severity: 'info',
      status: 'success',
      details: {
        loan_id: newLoan.id,
        amount,
        loan_plan_id: loanPlanId,
        sfd_id: client.sfd_id
      }
    });

    // Notifier les admins SFD
    const { data: sfdAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'sfd_admin');

    if (sfdAdmins && sfdAdmins.length > 0) {
      const notifications = sfdAdmins
        .filter(admin => {
          // Vérifier que l'admin appartient au même SFD
          return true; // TODO: filtrer par SFD
        })
        .map(admin => ({
          user_id: admin.user_id,
          type: 'loan_application',
          title: 'Nouvelle demande de prêt',
          message: `${client.full_name} a demandé un prêt de ${amount} FCFA`,
          action_url: `/sfd/loans/${newLoan.id}`
        }));

      await supabase.from('admin_notifications').insert(notifications);
    }

    console.log('Loan application successful:', newLoan.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: newLoan,
        message: 'Loan application submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in apply-for-loan:', error);
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
