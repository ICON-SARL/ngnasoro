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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { loanId, cashSessionId, disbursementMethod = 'cash' } = await req.json();

    console.log('Loan disbursement started:', { loanId, cashSessionId, userId: user.id });

    // Vérifier le rôle (cashier ou sfd_admin)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['cashier', 'sfd_admin'])
      .single();

    if (!userRole) {
      throw new Error('Only cashiers or SFD admins can disburse loans');
    }

    // Récupérer le prêt
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*, client:sfd_clients(*), sfd:sfds(*), collaterals:loan_collaterals(*)')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      throw new Error('Loan not found');
    }

    // Vérifications
    if (loan.status !== 'approved') {
      throw new Error(`Loan must be approved before disbursement (current: ${loan.status})`);
    }

    // Vérifier que l'utilisateur appartient au même SFD
    const { data: userSfd } = await supabase
      .from('user_sfds')
      .select('sfd_id')
      .eq('user_id', user.id)
      .eq('sfd_id', loan.sfd_id)
      .single();

    if (!userSfd) {
      throw new Error('You can only disburse loans from your SFD');
    }

    // Si méthode cash, vérifier qu'une caisse est ouverte
    if (disbursementMethod === 'cash') {
      if (!cashSessionId) {
        throw new Error('Cash session ID required for cash disbursement');
      }

      const { data: cashSession } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('id', cashSessionId)
        .eq('status', 'open')
        .eq('cashier_id', user.id)
        .single();

      if (!cashSession) {
        throw new Error('No open cash session found. Please open a cash session first.');
      }

      // Vérifier le solde de la caisse
      const { data: operations } = await supabase
        .from('cash_operations')
        .select('amount, operation_type')
        .eq('cash_session_id', cashSessionId);

      const currentBalance = cashSession.opening_balance + (operations?.reduce((sum, op) => {
        const multiplier = ['deposit', 'loan_repayment', 'transfer_in'].includes(op.operation_type) ? 1 : -1;
        return sum + (op.amount * multiplier);
      }, 0) || 0);

      if (currentBalance < loan.amount) {
        throw new Error(`Insufficient cash balance. Available: ${currentBalance} FCFA, Required: ${loan.amount} FCFA`);
      }
    }

    // Vérifier les subventions disponibles
    const { data: subsidies } = await supabase
      .from('sfd_subsidies')
      .select('*')
      .eq('sfd_id', loan.sfd_id)
      .eq('status', 'active')
      .order('start_date', { ascending: true });

    let subsidyUsed: any = null;
    const availableSubsidy = subsidies?.[0];

    if (availableSubsidy) {
      const remaining = availableSubsidy.amount - (availableSubsidy.used_amount || 0);
      if (remaining >= loan.amount) {
        subsidyUsed = availableSubsidy;
      }
    }

    // Calculer la première date de paiement (dans 1 mois)
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Décaisser le prêt
    const disbursedAt = new Date().toISOString();
    const { data: updatedLoan, error: updateError } = await supabase
      .from('sfd_loans')
      .update({
        status: 'active',
        disbursed_at: disbursedAt,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0]
      })
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating loan:', updateError);
      throw new Error('Failed to disburse loan');
    }

    // Créer la transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        user_id: loan.client.user_id,
        sfd_id: loan.sfd_id,
        amount: loan.amount,
        type: 'loan_disbursement',
        payment_method: disbursementMethod,
        status: 'completed',
        reference: `LOAN-${loanId.substring(0, 8)}`,
        description: `Disbursement of loan ${loan.amount} FCFA`,
        created_by: user.id
      })
      .select()
      .single();

    // Si cash, enregistrer l'opération de caisse
    if (disbursementMethod === 'cash' && cashSessionId) {
      await supabase.from('cash_operations').insert({
        cash_session_id: cashSessionId,
        transaction_id: transaction?.id,
        operation_type: 'loan_disbursement',
        amount: loan.amount,
        client_id: loan.client_id,
        reference: transaction?.reference,
        performed_by: user.id
      });
    }

    // Utiliser la subvention si applicable
    if (subsidyUsed) {
      await supabase
        .from('sfd_subsidies')
        .update({
          used_amount: (subsidyUsed.used_amount || 0) + loan.amount
        })
        .eq('id', subsidyUsed.id);

      await supabase.from('subsidy_usage').insert({
        subsidy_id: subsidyUsed.id,
        loan_id: loanId,
        amount: loan.amount,
        notes: `Disbursement for loan ${loanId}`
      });
    }

    // Logger l'activité
    await supabase.from('loan_activities').insert({
      loan_id: loanId,
      activity_type: 'loan_disbursed',
      description: `Loan disbursed: ${loan.amount} FCFA via ${disbursementMethod}`,
      performed_by: user.id
    });

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'loan_disbursement',
      category: 'LOAN',
      severity: 'info',
      status: 'success',
      details: {
        loan_id: loanId,
        amount: loan.amount,
        disbursement_method: disbursementMethod,
        subsidy_used: subsidyUsed?.id,
        cash_session_id: cashSessionId
      }
    });

    // Notifier le client
    if (loan.client.user_id) {
      await supabase.from('admin_notifications').insert({
        user_id: loan.client.user_id,
        type: 'loan_disbursed',
        title: 'Prêt décaissé',
        message: `Votre prêt de ${loan.amount} FCFA a été décaissé avec succès`,
        action_url: `/client/loans/${loanId}`
      });
    }

    console.log('Loan disbursement successful:', loanId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          loan: updatedLoan,
          transaction,
          subsidy_used: subsidyUsed?.id
        },
        message: 'Loan disbursed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in disburse-loan:', error);
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
