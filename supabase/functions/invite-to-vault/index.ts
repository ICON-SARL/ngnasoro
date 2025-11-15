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

    const { vault_id, phone, email } = await req.json();

    // Validation
    if (!vault_id || (!phone && !email)) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est le créateur ou admin du coffre
    const { data: vault, error: vaultError } = await supabase
      .from('collaborative_vaults')
      .select('*, collaborative_vault_members!inner(user_id, is_admin)')
      .eq('id', vault_id)
      .single();

    if (vaultError || !vault) {
      return new Response(
        JSON.stringify({ error: 'Coffre non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isCreator = vault.creator_id === user.id;
    const isAdmin = vault.collaborative_vault_members?.some(
      (m: any) => m.user_id === user.id && m.is_admin
    );

    if (!isCreator && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Vous n\'avez pas les permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chercher l'utilisateur à inviter
    let invited_user_id = null;
    if (phone) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .single();
      
      invited_user_id = profile?.id;
    } else if (email) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const matchedUser = userData.users?.find((u: any) => u.email === email);
      invited_user_id = matchedUser?.id;
    }

    // Vérifier si l'utilisateur essaie de s'inviter lui-même
    if (invited_user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Vous ne pouvez pas vous inviter vous-même' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si déjà membre
    if (invited_user_id) {
      const { data: existingMember } = await supabase
        .from('collaborative_vault_members')
        .select('id')
        .eq('vault_id', vault_id)
        .eq('user_id', invited_user_id)
        .single();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: 'Cet utilisateur est déjà membre' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Créer l'invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('collaborative_vault_invitations')
      .insert({
        vault_id,
        invited_by: user.id,
        phone,
        email,
        invited_user_id,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Erreur création invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Notifier l'utilisateur invité s'il existe
    if (invited_user_id) {
      await supabase.from('admin_notifications').insert({
        user_id: invited_user_id,
        title: 'Invitation à un coffre collaboratif',
        message: `Vous avez été invité à rejoindre le coffre "${vault.name}"`,
        type: 'vault_invite'
      });
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'vault_invitation_sent',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id,
        invitation_id: invitation.id,
        phone,
        email
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        invitation,
        message: 'Invitation envoyée avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur invite-to-vault:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
