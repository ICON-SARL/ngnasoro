import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the requesting user is an SFD admin
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Non autorisé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Utilisateur non authentifié' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if requesting user is SFD admin
    const { data: roleCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .in('role', ['sfd_admin', 'admin'])
      .maybeSingle();

    if (!roleCheck) {
      return new Response(
        JSON.stringify({ success: false, error: 'Permission refusée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Parse request body
    const { email, full_name, phone, role, sfd_id } = await req.json();

    if (!email || !full_name || !role || !sfd_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Données manquantes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate role
    const validRoles = ['cashier', 'supervisor', 'sfd_admin'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rôle invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify requesting user has access to this SFD
    const { data: sfdAccess } = await supabaseAdmin
      .from('user_sfds')
      .select('sfd_id')
      .eq('user_id', requestingUser.id)
      .eq('sfd_id', sfd_id)
      .maybeSingle();

    if (!sfdAccess && roleCheck.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Accès SFD non autorisé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        phone
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      
      // Check if user already exists
      if (createError.message?.includes('already registered')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cet email est déjà utilisé' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      throw createError;
    }

    const userId = newUser.user.id;

    // Update profile
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name,
        email,
        phone,
        updated_at: new Date().toISOString()
      });

    // Assign role
    await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });

    // Link to SFD
    await supabaseAdmin
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id,
        is_default: true
      });

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: requestingUser.id,
      action: 'create_sfd_user',
      category: 'user_management',
      severity: 'info',
      status: 'success',
      details: {
        created_user_id: userId,
        email,
        role,
        sfd_id
      }
    });

    console.log(`Created ${role} user:`, userId, email);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: `${role === 'cashier' ? 'Caissier' : 'Utilisateur'} créé avec succès`,
        temp_password: tempPassword // In production, send this via secure channel
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in create-sfd-user:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur serveur' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
