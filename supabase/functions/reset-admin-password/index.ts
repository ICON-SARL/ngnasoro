import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Nouveau mot de passe fort
    const newPassword = 'MerefAdmin2025!Secure';
    
    // Trouver l'utilisateur admin@meref.gov.ml
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list users', details: listError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const adminUser = users.users.find(u => u.email === 'admin@meref.gov.ml');
    
    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: 'Admin user not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Réinitialiser le mot de passe
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      { 
        password: newPassword,
        email_confirm: true // S'assurer que l'email est confirmé
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password', details: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Log dans audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      action: 'password_reset',
      category: 'security',
      severity: 'info',
      status: 'success',
      details: {
        user_email: 'admin@meref.gov.ml',
        reset_at: new Date().toISOString(),
        method: 'edge_function'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
        credentials: {
          email: 'admin@meref.gov.ml',
          password: newPassword
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
