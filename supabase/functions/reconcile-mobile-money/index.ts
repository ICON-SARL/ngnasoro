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

    const { sfdId, operator, reconciliationDate } = await req.json();
    const date = reconciliationDate || new Date().toISOString().split('T')[0];

    console.log('Mobile Money reconciliation started:', { sfdId, operator, date, userId: user.id });

    // Vérifier que l'utilisateur est sfd_admin ou admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['sfd_admin', 'admin'])
      .single();

    if (!userRole) {
      throw new Error('Only SFD admins or admins can perform reconciliation');
    }

    // Pour sfd_admin, vérifier l'appartenance au SFD
    if (userRole.role === 'sfd_admin') {
      const { data: userSfd } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .single();

      if (!userSfd) {
        throw new Error('You can only reconcile for your SFD');
      }
    }

    // Vérifier qu'une réconciliation n'existe pas déjà
    const { data: existingReconciliation } = await supabase
      .from('mobile_money_reconciliations')
      .select('id, status')
      .eq('sfd_id', sfdId)
      .eq('operator', operator)
      .eq('reconciliation_date', date)
      .maybeSingle();

    if (existingReconciliation && existingReconciliation.status === 'completed') {
      throw new Error('Reconciliation already completed for this date and operator');
    }

    // Récupérer tous les webhooks du jour pour l'opérateur
    const startDate = `${date} 00:00:00`;
    const endDate = `${date} 23:59:59`;

    const { data: webhooks, error: webhooksError } = await supabase
      .from('mobile_money_webhooks')
      .select('*')
      .eq('operator', operator)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      throw new Error('Failed to fetch webhooks');
    }

    // Récupérer toutes les transactions Mobile Money du jour pour le SFD
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('sfd_id', sfdId)
      .eq('payment_method', 'mobile_money')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      throw new Error('Failed to fetch transactions');
    }

    // Calculer les statistiques
    const totalWebhooks = webhooks?.length || 0;
    const totalTransactions = transactions?.length || 0;

    // Comparer les références pour trouver les correspondances
    const webhookRefs = new Set(webhooks?.map(w => w.payload?.transaction_id || w.payload?.reference) || []);
    const transactionRefs = new Set(transactions?.map(t => t.reference) || []);

    const matchedRefs = new Set([...webhookRefs].filter(ref => transactionRefs.has(ref)));
    const matchedCount = matchedRefs.size;

    const unmatchedWebhooks = totalWebhooks - matchedCount;
    const unmatchedTransactions = totalTransactions - matchedCount;

    // Calculer les montants
    const totalAmountWebhooks = webhooks?.reduce((sum, w) => sum + (w.payload?.amount || 0), 0) || 0;
    const totalAmountTransactions = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const differenceAmount = totalAmountTransactions - totalAmountWebhooks;

    // Déterminer le statut
    let status = 'completed';
    if (unmatchedWebhooks > 0 || unmatchedTransactions > 0 || Math.abs(differenceAmount) > 100) {
      status = 'has_discrepancies';
    }

    // Créer ou mettre à jour la réconciliation
    const reconciliationData = {
      sfd_id: sfdId,
      reconciliation_date: date,
      operator,
      total_webhooks: totalWebhooks,
      total_transactions: totalTransactions,
      matched_count: matchedCount,
      unmatched_webhooks: unmatchedWebhooks,
      unmatched_transactions: unmatchedTransactions,
      total_amount_webhooks: totalAmountWebhooks,
      total_amount_transactions: totalAmountTransactions,
      difference_amount: differenceAmount,
      status,
      reconciled_by: user.id,
      reconciled_at: new Date().toISOString()
    };

    let reconciliation;
    if (existingReconciliation) {
      const { data, error } = await supabase
        .from('mobile_money_reconciliations')
        .update(reconciliationData)
        .eq('id', existingReconciliation.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating reconciliation:', error);
        throw new Error('Failed to update reconciliation');
      }
      reconciliation = data;
    } else {
      const { data, error } = await supabase
        .from('mobile_money_reconciliations')
        .insert(reconciliationData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating reconciliation:', error);
        throw new Error('Failed to create reconciliation');
      }
      reconciliation = data;
    }

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'mobile_money_reconciliation',
      category: 'PAYMENT',
      severity: status === 'has_discrepancies' ? 'warn' : 'info',
      status: 'success',
      details: {
        reconciliation_id: reconciliation.id,
        sfd_id: sfdId,
        operator,
        date,
        matched_count: matchedCount,
        discrepancies: status === 'has_discrepancies',
        difference_amount: differenceAmount
      }
    });

    // Si discrepancies, notifier les admins
    if (status === 'has_discrepancies') {
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'sfd_admin']);

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.user_id,
          type: 'reconciliation_discrepancy',
          title: 'Écarts de réconciliation détectés',
          message: `Réconciliation ${operator} du ${date}: ${unmatchedWebhooks} webhooks non matchés, ${unmatchedTransactions} transactions non matchées, écart de ${differenceAmount} FCFA`,
          action_url: `/sfd/reconciliations/${reconciliation.id}`
        }));

        await supabase.from('admin_notifications').insert(notifications);
      }
    }

    console.log('Reconciliation completed:', { 
      reconciliationId: reconciliation.id, 
      status, 
      hasDiscrepancies: status === 'has_discrepancies' 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          reconciliation,
          summary: {
            total_webhooks: totalWebhooks,
            total_transactions: totalTransactions,
            matched: matchedCount,
            unmatched_webhooks: unmatchedWebhooks,
            unmatched_transactions: unmatchedTransactions,
            difference_amount: differenceAmount
          }
        },
        message: status === 'has_discrepancies' 
          ? 'Reconciliation completed with discrepancies' 
          : 'Reconciliation completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reconcile-mobile-money:', error);
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
