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

    const { vault_id, amount, reason } = await req.json();

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
      // TODO: Implémenter le traitement du retrait
      // Pour l'instant, on enregistre juste la demande approuvée
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
        message: status === 'approved' ? 'Retrait approuvé' : 'Demande créée, en attente de votes'
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
