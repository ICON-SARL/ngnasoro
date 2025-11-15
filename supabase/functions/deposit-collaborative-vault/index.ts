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

    const { vault_id, amount, source_account_id, description } = await req.json();

    // Validation
    if (!vault_id || !amount || amount <= 0 || !source_account_id) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le coffre existe et récupérer ses infos
    const { data: vault, error: vaultError } = await supabase
      .from('collaborative_vaults')
      .select('*, collaborative_vault_members!inner(user_id, status)')
      .eq('id', vault_id)
      .single();

    if (vaultError || !vault) {
      return new Response(
        JSON.stringify({ error: 'Coffre non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est membre actif
    const isMember = vault.collaborative_vault_members?.some(
      (m: any) => m.user_id === user.id && m.status === 'active'
    );

    if (!isMember) {
      return new Response(
        JSON.stringify({ error: 'Vous devez être membre de ce coffre' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le compte source
    const { data: sourceAccount, error: sourceError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', source_account_id)
      .eq('user_id', user.id)
      .single();

    if (sourceError || !sourceAccount || sourceAccount.balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Solde insuffisant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le member_id
    const { data: memberData } = await supabase
      .from('collaborative_vault_members')
      .select('id')
      .eq('vault_id', vault_id)
      .eq('user_id', user.id)
      .single();

    // Débiter le compte source
    const { error: debitError } = await supabase
      .from('accounts')
      .update({ balance: sourceAccount.balance - amount })
      .eq('id', source_account_id);

    if (debitError) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors du débit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créditer le coffre collaboratif directement
    const { error: creditError } = await supabase
      .from('collaborative_vaults')
      .update({ current_amount: ((vault as any).current_amount || 0) + amount })
      .eq('id', vault_id);

    if (creditError) {
      console.error('Erreur crédit coffre:', creditError);
      // Rollback
      await supabase
        .from('accounts')
        .update({ balance: sourceAccount.balance })
        .eq('id', source_account_id);

      return new Response(
        JSON.stringify({ error: 'Erreur lors du crédit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer la transaction
    const { error: transactionError } = await supabase
      .from('collaborative_vault_transactions')
      .insert({
        vault_id,
        member_id: memberData?.id,
        user_id: user.id,
        transaction_type: 'deposit',
        amount,
        balance_after: (vault as any).current_amount + amount,
        description: description || 'Dépôt dans le coffre collaboratif',
        payment_method: 'sfd_account'
      });

    if (transactionError) {
      console.error('Erreur transaction log:', transactionError);
    }

    // Notifier les autres membres
    await supabase.rpc('notify_vault_members', {
      _vault_id: vault_id,
      _title: 'Nouveau dépôt',
      _message: `Un membre a déposé ${amount} FCFA dans ${vault.name}`,
      _type: 'vault_deposit',
      _exclude_user_id: user.id
    });

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'collaborative_vault_deposit',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id,
        amount,
        new_balance: (vault as any).current_amount + amount
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Dépôt effectué avec succès',
        new_balance: (vault as any).current_amount + amount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur deposit-collaborative-vault:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
