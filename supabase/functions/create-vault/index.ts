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

    // Vérifier l'authentification
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

    const { name, description, target_amount, type, deadline, sfd_id } = await req.json();

    // Validation
    if (!name || !target_amount || target_amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'locked' && !deadline) {
      return new Response(
        JSON.stringify({ error: 'Une date limite est requise pour un coffre verrouillé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un compte dédié pour le coffre
    const { data: vaultAccount, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        sfd_id: sfd_id,
        balance: 0,
        currency: 'FCFA',
        status: 'active'
      })
      .select()
      .single();

    if (accountError) {
      console.error('Erreur création compte:', accountError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du compte' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer le coffre
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .insert({
        user_id: user.id,
        sfd_id: sfd_id,
        vault_account_id: vaultAccount.id,
        name,
        description,
        target_amount,
        type: type || 'simple',
        deadline: deadline || null,
        status: 'active'
      })
      .select()
      .single();

    if (vaultError) {
      console.error('Erreur création coffre:', vaultError);
      // Supprimer le compte créé en cas d'erreur
      await supabase.from('accounts').delete().eq('id', vaultAccount.id);
      
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du coffre' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'vault_created',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id: vault.id,
        name,
        target_amount,
        type
      }
    });

    console.log('Coffre créé:', vault.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        vault,
        message: 'Coffre créé avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur create-vault:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});