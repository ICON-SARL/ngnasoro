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

    if (!vault_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le coffre
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vault_id)
      .eq('user_id', user.id)
      .single();

    if (vaultError || !vault) {
      return new Response(
        JSON.stringify({ error: 'Coffre introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (vault.status === 'closed') {
      return new Response(
        JSON.stringify({ error: 'Ce coffre est fermé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le compte source
    const { data: sourceAccount, error: sourceError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', source_account_id)
      .eq('user_id', user.id)
      .single();

    if (sourceError || !sourceAccount) {
      return new Response(
        JSON.stringify({ error: 'Compte source introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (sourceAccount.balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Solde insuffisant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Débiter le compte source
    const { error: debitError } = await supabase
      .from('accounts')
      .update({ balance: sourceAccount.balance - amount })
      .eq('id', source_account_id);

    if (debitError) {
      console.error('Erreur débit:', debitError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors du débit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créditer le coffre directement
    const { error: creditError } = await supabase
      .from('vaults')
      .update({ current_amount: (vault.current_amount || 0) + amount })
      .eq('id', vault_id);

    if (creditError) {
      console.error('Erreur crédit:', creditError);
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

    // Enregistrer la contribution (le trigger mettra à jour current_amount automatiquement)
    const { data: contribution, error: contribError } = await supabase
      .from('vault_contributions')
      .insert({
        vault_id,
        user_id: user.id,
        source_account_id,
        amount,
        description: description || `Dépôt de ${amount} FCFA`
      })
      .select()
      .single();

    if (contribError) {
      console.error('Erreur contribution:', contribError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'enregistrement' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer la transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      sfd_id: vault.sfd_id,
      account_id: source_account_id,
      amount: -amount,
      type: 'vault_deposit',
      description: `Dépôt vers coffre: ${vault.name}`,
      payment_method: 'cash',
      status: 'completed'
    });

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'vault_deposit',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id,
        amount,
        vault_name: vault.name
      }
    });

    // Récupérer le coffre mis à jour
    const { data: updatedVault } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vault_id)
      .single();

    console.log('Dépôt effectué:', vault_id, amount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contribution,
        vault: updatedVault,
        message: 'Dépôt effectué avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur deposit-vault:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});