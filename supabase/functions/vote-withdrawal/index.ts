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

    const { withdrawal_request_id, vote, comment } = await req.json();

    // Validation
    if (!withdrawal_request_id || typeof vote !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer la demande de retrait avec les infos du coffre
    const { data: request, error: requestError } = await supabase
      .from('collaborative_vault_withdrawal_requests')
      .select('*, collaborative_vaults(current_amount, name, sfd_id)')
      .eq('id', withdrawal_request_id)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Demande de retrait non trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Cette demande a déjà été traitée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est membre du coffre
    const { data: member, error: memberError } = await supabase
      .from('collaborative_vault_members')
      .select('id')
      .eq('vault_id', request.vault_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: 'Vous n\'êtes pas membre de ce coffre' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si l'utilisateur a déjà voté
    const { data: existingVote } = await supabase
      .from('collaborative_vault_withdrawal_votes')
      .select('id')
      .eq('withdrawal_request_id', withdrawal_request_id)
      .eq('member_id', member.id)
      .single();

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: 'Vous avez déjà voté' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer le vote
    const { error: voteError } = await supabase
      .from('collaborative_vault_withdrawal_votes')
      .insert({
        vault_id: request.vault_id,
        withdrawal_request_id,
        member_id: member.id,
        vote,
        comment
      });

    if (voteError) {
      console.error('Erreur enregistrement vote:', voteError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'enregistrement du vote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour les compteurs de votes
    const newVotesYes = vote ? request.votes_yes + 1 : request.votes_yes;
    const newVotesNo = !vote ? request.votes_no + 1 : request.votes_no;

    let newStatus = 'pending';
    
    // Vérifier si la majorité est atteinte
    if (newVotesYes >= request.total_votes_required) {
      newStatus = 'approved';
    } else if (newVotesNo > (request.total_votes_required || 0)) {
      newStatus = 'rejected';
    }

    // Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('collaborative_vault_withdrawal_requests')
      .update({
        votes_yes: newVotesYes,
        votes_no: newVotesNo,
        status: newStatus,
        processed_at: newStatus !== 'pending' ? new Date().toISOString() : null
      })
      .eq('id', withdrawal_request_id);

    if (updateError) {
      console.error('Erreur mise à jour demande:', updateError);
    }

    // Si approuvé, exécuter le retrait
    if (newStatus === 'approved') {
      const vault = request.collaborative_vaults;
      const newBalance = vault.current_amount - request.amount;

      // Débiter le coffre
      await supabase
        .from('collaborative_vaults')
        .update({ 
          current_amount: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.vault_id);

      // Enregistrer la transaction de retrait
      await supabase
        .from('collaborative_vault_transactions')
        .insert({
          vault_id: request.vault_id,
          user_id: request.requested_by,
          transaction_type: 'withdrawal',
          amount: request.amount,
          balance_after: newBalance,
          description: `Retrait approuvé par vote (${newVotesYes}/${request.total_votes_required})`
        });

      // Créditer le compte du demandeur
      const { data: userAccount } = await supabase
        .from('accounts')
        .select('id, balance')
        .eq('user_id', request.requested_by)
        .eq('sfd_id', vault.sfd_id)
        .eq('account_type', 'operation')
        .single();

      if (userAccount) {
        await supabase
          .from('accounts')
          .update({ balance: userAccount.balance + request.amount })
          .eq('id', userAccount.id);
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
          .eq('id', request.vault_id);

        // Notifier tous les membres
        await supabase.rpc('notify_vault_members', {
          _vault_id: request.vault_id,
          _title: 'Coffre fermé',
          _message: `Le coffre "${vault.name}" a été fermé suite au retrait total des fonds`,
          _type: 'vault_closed',
          _exclude_user_id: null
        });
      }

      // Notifier le demandeur
      await supabase.from('admin_notifications').insert({
        user_id: request.requested_by,
        title: 'Retrait approuvé',
        message: `Votre demande de retrait de ${request.amount} FCFA a été approuvée et créditée sur votre compte`,
        type: 'withdrawal_approved'
      });
    } else if (newStatus === 'rejected') {
      await supabase.from('admin_notifications').insert({
        user_id: request.requested_by,
        title: 'Retrait rejeté',
        message: `Votre demande de retrait de ${request.amount} FCFA a été rejetée par les membres`,
        type: 'withdrawal_rejected'
      });
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'withdrawal_vote',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        withdrawal_request_id,
        vote,
        new_status: newStatus,
        votes_yes: newVotesYes,
        votes_no: newVotesNo
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: newStatus === 'approved' ? 'Retrait approuvé et exécuté' : 
                 newStatus === 'rejected' ? 'Retrait rejeté' : 'Vote enregistré',
        status: newStatus,
        votes_yes: newVotesYes,
        votes_no: newVotesNo
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur vote-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
