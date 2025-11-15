import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { invitation_id, action } = await req.json();

    // Validate input
    if (!invitation_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Paramètres manquants' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Action invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('collaborative_vault_invitations')
      .select('*, collaborative_vaults(name, creator_id)')
      .eq('id', invitation_id)
      .single();

    if (inviteError || !invitation) {
      console.error('Erreur récupération invitation:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Invitation introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify invitation is for the authenticated user
    if (invitation.invited_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Cette invitation ne vous est pas destinée' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify invitation is pending
    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Cette invitation a déjà été traitée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Cette invitation a expiré' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'accept') {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('collaborative_vault_members')
        .select('id')
        .eq('vault_id', invitation.vault_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: 'Vous êtes déjà membre de ce coffre' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create member
      const { error: memberError } = await supabase
        .from('collaborative_vault_members')
        .insert({
          vault_id: invitation.vault_id,
          user_id: user.id,
          invited_by: invitation.invited_by,
          status: 'active',
          is_admin: false,
          total_contributed: 0
        });

      if (memberError) {
        console.error('Erreur création membre:', memberError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de l\'acceptation de l\'invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('collaborative_vault_invitations')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', invitation_id);

      if (updateError) {
        console.error('Erreur mise à jour invitation:', updateError);
      }

      // Send notification to vault creator
      const vaultData = invitation.collaborative_vaults as any;
      await supabase
        .from('admin_notifications')
        .insert({
          user_id: vaultData.creator_id,
          title: 'Nouvelle adhésion au coffre',
          message: `Un membre a accepté votre invitation pour le coffre "${vaultData.name}"`,
          type: 'vault_invitation_accepted',
          action_url: `/mobile-flow/collaborative-vault/${invitation.vault_id}`
        });

      // Log in audit_logs
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'accept_vault_invitation',
          category: 'vault',
          severity: 'info',
          status: 'success',
          details: {
            invitation_id,
            vault_id: invitation.vault_id,
            vault_name: vaultData.name
          }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation acceptée avec succès',
          vault_id: invitation.vault_id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Reject invitation
      const { error: updateError } = await supabase
        .from('collaborative_vault_invitations')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', invitation_id);

      if (updateError) {
        console.error('Erreur mise à jour invitation:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors du rejet de l\'invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send notification to vault creator
      const vaultData = invitation.collaborative_vaults as any;
      await supabase
        .from('admin_notifications')
        .insert({
          user_id: vaultData.creator_id,
          title: 'Invitation refusée',
          message: `Un membre a refusé votre invitation pour le coffre "${vaultData.name}"`,
          type: 'vault_invitation_rejected',
          action_url: `/mobile-flow/collaborative-vault/${invitation.vault_id}`
        });

      // Log in audit_logs
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'reject_vault_invitation',
          category: 'vault',
          severity: 'info',
          status: 'success',
          details: {
            invitation_id,
            vault_id: invitation.vault_id,
            vault_name: vaultData.name
          }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation refusée' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
