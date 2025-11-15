import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Vérifier que l'utilisateur est admin
    const { data: roleCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleCheck) {
      throw new Error('User is not an admin');
    }

    const { sfd_id, rejection_reason } = await req.json();

    if (!sfd_id || !rejection_reason) {
      throw new Error('SFD ID and rejection reason are required');
    }

    console.log(`Rejecting SFD ${sfd_id} by admin ${user.id}`);

    // Mettre à jour le statut du SFD
    const { error: updateError } = await supabaseAdmin
      .from('sfds')
      .update({
        status: 'suspended',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        suspension_reason: rejection_reason,
        approval_notes: rejection_reason
      })
      .eq('id', sfd_id);

    if (updateError) {
      throw new Error(`Failed to update SFD: ${updateError.message}`);
    }

    // Créer une entrée dans l'historique
    const { error: historyError } = await supabaseAdmin
      .from('sfd_approval_history')
      .insert({
        sfd_id,
        reviewed_by: user.id,
        action: 'rejected',
        comments: rejection_reason,
        reviewed_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Failed to create history entry:', historyError);
    }

    // Logger dans audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'sfd_rejected',
      category: 'sfd_management',
      severity: 'warn',
      status: 'success',
      details: {
        sfd_id,
        rejection_reason
      }
    });

    // Récupérer les admins du SFD pour notifier
    const { data: sfdAdmins } = await supabaseAdmin
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfd_id);

    // Envoyer notification aux admins SFD
    if (sfdAdmins && sfdAdmins.length > 0) {
      const notifications = sfdAdmins.map(admin => ({
        user_id: admin.user_id,
        title: 'SFD Rejeté',
        message: `Votre demande de SFD a été rejetée. Raison: ${rejection_reason}`,
        type: 'sfd_rejection',
        action_url: '/sfd-dashboard'
      }));

      await supabaseAdmin
        .from('admin_notifications')
        .insert(notifications);
    }

    console.log(`✅ SFD ${sfd_id} rejected successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SFD rejeté avec succès'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error rejecting SFD:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
