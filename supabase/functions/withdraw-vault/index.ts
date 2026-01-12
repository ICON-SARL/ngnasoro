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

    const { vault_id, amount, destination_account_id, description } = await req.json();

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

    // Vérifier les restrictions selon le type de coffre
    if (vault.type === 'locked' && vault.deadline) {
      const now = new Date();
      const deadline = new Date(vault.deadline);
      if (now < deadline) {
        return new Response(
          JSON.stringify({ 
            error: `Ce coffre est verrouillé jusqu'au ${deadline.toLocaleDateString('fr-FR')}` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (vault.current_amount < amount) {
      return new Response(
        JSON.stringify({ error: 'Solde insuffisant dans le coffre' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le compte destination
    const { data: destAccount, error: destError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', destination_account_id)
      .eq('user_id', user.id)
      .single();

    if (destError || !destAccount) {
      return new Response(
        JSON.stringify({ error: 'Compte destination introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Débiter le coffre directement
    const { error: debitError } = await supabase
      .from('vaults')
      .update({ current_amount: (vault.current_amount || 0) - amount })
      .eq('id', vault_id);

    if (debitError) {
      console.error('Erreur débit coffre:', debitError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors du débit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créditer le compte destination
    const { error: creditError } = await supabase
      .from('accounts')
      .update({ balance: destAccount.balance + amount })
      .eq('id', destination_account_id);

    if (creditError) {
      console.error('Erreur crédit destination:', creditError);
      // Rollback - re-créditer le coffre
      await supabase
        .from('vaults')
        .update({ current_amount: vault.current_amount })
        .eq('id', vault_id);
      
      return new Response(
        JSON.stringify({ error: 'Erreur lors du crédit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer le retrait (le trigger mettra à jour current_amount automatiquement)
    const { data: withdrawal, error: withdrawError } = await supabase
      .from('vault_withdrawals')
      .insert({
        vault_id,
        user_id: user.id,
        destination_account_id,
        amount,
        description: description || `Retrait de ${amount} FCFA`
      })
      .select()
      .single();

    if (withdrawError) {
      console.error('Erreur retrait:', withdrawError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'enregistrement' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer la transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      sfd_id: vault.sfd_id,
      account_id: destination_account_id,
      amount: amount,
      type: 'vault_withdrawal',
      description: `Retrait depuis coffre: ${vault.name}`,
      payment_method: 'cash',
      status: 'completed'
    });

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'vault_withdrawal',
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

    console.log('Retrait effectué:', vault_id, amount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        withdrawal,
        vault: updatedVault,
        message: 'Retrait effectué avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur withdraw-vault:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});