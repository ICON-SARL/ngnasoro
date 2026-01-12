import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { vault_id, amount, reason, destination_account_id } = await req.json();

    // Validation
    if (!vault_id || !amount || amount <= 0 || !reason) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le coffre et compter les membres actifs
    const { data: vault, error: vaultError } = await supabase
      .from('collaborative_vaults')
      .select('*, collaborative_vault_members!inner(id, user_id, status)')
      .eq('id', vault_id)
      .single();

    if (vaultError || !vault) {
      return new Response(
        JSON.stringify({ error: 'Coffre non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le coffre est actif
    if (vault.status === 'closed') {
      return new Response(
        JSON.stringify({ error: 'Ce coffre est fermé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est membre
    const isMember = vault.collaborative_vault_members?.some(
      (m: any) => m.user_id === user.id && m.status === 'active'
    );

    if (!isMember) {
      return new Response(
        JSON.stringify({ error: 'Vous devez être membre de ce coffre' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le solde disponible
    if ((vault as any).current_amount < amount) {
      return new Response(
        JSON.stringify({ error: 'Solde insuffisant dans le coffre' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isCreator = vault.creator_id === user.id;
    const withdrawalRule = vault.withdrawal_rule;
    
    // Compter les membres actifs
    const activeMembers = vault.collaborative_vault_members?.filter(
      (m: any) => m.status === 'active'
    ).length || 0;

    let totalVotesRequired = 0;
    let status = 'pending';

    // Si creator_only et c'est le créateur → auto-approve
    if (withdrawalRule === 'creator_only' && isCreator) {
      status = 'approved';
    } else if (withdrawalRule === 'majority_vote') {
      totalVotesRequired = Math.ceil(activeMembers / 2);
    } else if (withdrawalRule === 'unanimous') {
      totalVotesRequired = activeMembers;
    } else if (withdrawalRule === 'creator_only' && !isCreator) {
      return new Response(
        JSON.stringify({ error: 'Seul le créateur peut demander un retrait' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer la demande de retrait
    const { data: request, error: requestError } = await supabase
      .from('collaborative_vault_withdrawal_requests')
      .insert({
        vault_id,
        requested_by: user.id,
        amount,
        reason,
        status,
        total_votes_required: totalVotesRequired
      })
      .select()
      .single();

    if (requestError) {
      console.error('Erreur création demande retrait:', requestError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la demande' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si auto-approved, traiter le retrait immédiatement
    if (status === 'approved') {
      await processWithdrawal(supabase, vault_id, user.id, amount, request.id, destination_account_id);
    } else {
      // Notifier les membres pour voter
      await supabase.rpc('notify_vault_members', {
        _vault_id: vault_id,
        _title: 'Demande de retrait',
        _message: `Une demande de retrait de ${amount} FCFA nécessite votre vote`,
        _type: 'vote_needed',
        _exclude_user_id: user.id
      });
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'vault_withdrawal_requested',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id,
        request_id: request.id,
        amount,
        status
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        request,
        message: status === 'approved' ? 'Retrait effectué' : 'Demande créée, en attente de votes'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur request-vault-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fonction pour traiter le retrait approuvé
async function processWithdrawal(
  supabase: any, 
  vault_id: string, 
  user_id: string, 
  amount: number, 
  request_id: string,
  destination_account_id?: string
) {
  // Récupérer le coffre
  const { data: vault } = await supabase
    .from('collaborative_vaults')
    .select('current_amount, name')
    .eq('id', vault_id)
    .single();

  if (!vault) return;

  const newBalance = vault.current_amount - amount;

  // Débiter le coffre
  await supabase
    .from('collaborative_vaults')
    .update({ 
      current_amount: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', vault_id);

  // Enregistrer la transaction de retrait
  await supabase
    .from('collaborative_vault_transactions')
    .insert({
      vault_id,
      user_id,
      transaction_type: 'withdrawal',
      amount,
      balance_after: newBalance,
      description: 'Retrait approuvé'
    });

  // Si un compte destination est fourni, créditer ce compte
  if (destination_account_id) {
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', destination_account_id)
      .single();

    if (account) {
      await supabase
        .from('accounts')
        .update({ balance: account.balance + amount })
        .eq('id', destination_account_id);
    }
  }

  // Si le solde est à 0, fermer le coffre
  if (newBalance <= 0) {
    await supabase
      .from('collaborative_vaults')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString(),
        close_reason: 'Retrait total effectué'
      })
      .eq('id', vault_id);

    // Notifier tous les membres
    await supabase.rpc('notify_vault_members', {
      _vault_id: vault_id,
      _title: 'Coffre fermé',
      _message: `Le coffre "${vault.name}" a été fermé suite au retrait total des fonds`,
      _type: 'vault_closed',
      _exclude_user_id: null
    });
  }

  // Mettre à jour la demande comme traitée
  await supabase
    .from('collaborative_vault_withdrawal_requests')
    .update({ 
      processed_at: new Date().toISOString()
    })
    .eq('id', request_id);
}
