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

    const { 
      name, description, target_amount, sfd_id, visibility, 
      withdrawal_rule, allow_withdrawal_before_goal, deadline 
    } = await req.json();

    // Validation
    if (!name || !target_amount || target_amount <= 0 || !sfd_id) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer coffre collaboratif directement (sans compte séparé, utilise current_amount)
    const { data: vault, error: vaultError } = await supabase
      .from('collaborative_vaults')
      .insert({
        creator_id: user.id,
        sfd_id,
        vault_account_id: null,
        name,
        description,
        target_amount,
        visibility: visibility || 'private',
        withdrawal_rule: withdrawal_rule || 'creator_only',
        allow_withdrawal_before_goal: allow_withdrawal_before_goal || false,
        deadline: deadline || null,
        status: 'active'
      })
      .select()
      .single();

    if (vaultError) {
      console.error('Erreur création coffre collaboratif:', vaultError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du coffre' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'collaborative_vault_created',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id: vault.id,
        name,
        target_amount,
        visibility,
        withdrawal_rule
      }
    });

    console.log('Coffre collaboratif créé:', vault.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        vault,
        message: 'Coffre collaboratif créé avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur create-collaborative-vault:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
