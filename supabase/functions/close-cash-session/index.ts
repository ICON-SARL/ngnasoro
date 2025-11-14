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

    const { sessionId, closingBalance, notes } = await req.json();

    console.log('Closing cash session:', { sessionId, closingBalance, userId: user.id });

    // Vérifier que l'utilisateur est un cashier
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'cashier')
      .single();

    if (!userRole) {
      throw new Error('Only cashiers can close cash sessions');
    }

    // Récupérer la session
    const { data: session, error: sessionError } = await supabase
      .from('cash_sessions')
      .select('*, operations:cash_operations(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Cash session not found');
    }

    // Vérifier que c'est la session du cashier
    if (session.cashier_id !== user.id) {
      throw new Error('You can only close your own cash sessions');
    }

    // Vérifier que la session est ouverte
    if (session.status !== 'open') {
      throw new Error(`Session is not open (current status: ${session.status})`);
    }

    // Calculer le solde attendu
    const expectedBalance = session.opening_balance + (session.operations?.reduce((sum: number, op: any) => {
      const multiplier = ['deposit', 'loan_repayment', 'transfer_in'].includes(op.operation_type) ? 1 : -1;
      return sum + (op.amount * multiplier);
    }, 0) || 0);

    // Calculer la différence
    const difference = closingBalance - expectedBalance;
    const hasDifference = Math.abs(difference) > 0.01; // Tolérance de 1 centime

    // Déterminer le statut
    let status = 'closed';
    if (hasDifference && Math.abs(difference) > 10000) {
      // Si écart > 10,000 FCFA, nécessite validation superviseur
      status = 'closed'; // Restera en attente de validation
    }

    // Mettre à jour la session
    const { data: updatedSession, error: updateError } = await supabase
      .from('cash_sessions')
      .update({
        closing_balance: closingBalance,
        expected_balance: expectedBalance,
        difference,
        status,
        closed_at: new Date().toISOString(),
        notes: notes || session.notes
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw new Error('Failed to close cash session');
    }

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'cash_session_closed',
      category: 'CASH',
      severity: hasDifference ? 'warn' : 'info',
      status: 'success',
      details: {
        session_id: sessionId,
        sfd_id: session.sfd_id,
        opening_balance: session.opening_balance,
        closing_balance: closingBalance,
        expected_balance: expectedBalance,
        difference,
        requires_validation: hasDifference && Math.abs(difference) > 10000
      }
    });

    // Si écart important, notifier les superviseurs
    if (hasDifference && Math.abs(difference) > 10000) {
      const { data: supervisors } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'supervisor');

      if (supervisors && supervisors.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const notifications = supervisors.map(supervisor => ({
          user_id: supervisor.user_id,
          type: 'cash_discrepancy',
          title: 'Écart de caisse détecté',
          message: `${profile?.full_name || 'Un caissier'} a un écart de ${difference} FCFA (attendu: ${expectedBalance}, déclaré: ${closingBalance})`,
          action_url: `/sfd/cash-sessions/${sessionId}`
        }));

        await supabase.from('admin_notifications').insert(notifications);
      }
    }

    console.log('Cash session closed:', { sessionId, difference, requiresValidation: hasDifference && Math.abs(difference) > 10000 });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          session: updatedSession,
          expected_balance: expectedBalance,
          difference,
          requires_validation: hasDifference && Math.abs(difference) > 10000
        },
        message: hasDifference && Math.abs(difference) > 10000
          ? 'Cash session closed. Supervisor validation required due to significant discrepancy.'
          : 'Cash session closed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in close-cash-session:', error);
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
