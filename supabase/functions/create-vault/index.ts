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

    const { name, description, target_amount, type, deadline, sfd_id: requestedSfdId } = await req.json();

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

    // Récupérer le SFD valide de l'utilisateur depuis user_sfds
    let validSfdId = requestedSfdId;
    
    if (requestedSfdId) {
      // Vérifier que l'utilisateur appartient bien à ce SFD
      const { data: userSfd } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .eq('sfd_id', requestedSfdId)
        .single();
      
      if (!userSfd) {
        // Le sfd_id demandé n'est pas valide, chercher le SFD par défaut
        const { data: defaultSfd } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();
        
        if (defaultSfd) {
          validSfdId = defaultSfd.sfd_id;
        } else {
          // Prendre le premier SFD disponible
          const { data: anySfd } = await supabase
            .from('user_sfds')
            .select('sfd_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();
          
          validSfdId = anySfd?.sfd_id || null;
        }
      }
    } else {
      // Pas de sfd_id fourni, chercher le SFD par défaut
      const { data: defaultSfd } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();
      
      if (defaultSfd) {
        validSfdId = defaultSfd.sfd_id;
      } else {
        const { data: anySfd } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        
        validSfdId = anySfd?.sfd_id || null;
      }
    }

    // Si toujours pas de SFD valide, retourner une erreur
    if (!validSfdId) {
      return new Response(
        JSON.stringify({ error: 'Vous devez être membre d\'un SFD pour créer un coffre' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer le coffre avec le sfd_id valide
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .insert({
        user_id: user.id,
        sfd_id: validSfdId,
        vault_account_id: null,
        name,
        description,
        target_amount,
        current_amount: 0,
        type: type || 'simple',
        deadline: deadline || null,
        status: 'active'
      })
      .select()
      .single();

    if (vaultError) {
      console.error('Erreur création coffre:', vaultError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du coffre', details: vaultError.message }),
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
        type,
        sfd_id: validSfdId
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
