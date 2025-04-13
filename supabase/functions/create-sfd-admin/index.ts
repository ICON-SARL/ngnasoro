
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Edge function create-sfd-admin started");
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth token to verify the caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorisé: Token manquant" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the caller's role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Non autorisé: Utilisateur non authentifié" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the caller is a MEREF admin
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    if (rolesError) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la vérification des rôles: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isAdmin = roles.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Non autorisé: Droits d'administrateur requis" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing JSON body:", e);
      return new Response(
        JSON.stringify({ error: "Format de requête invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { adminData } = requestBody;
    
    if (!adminData || !adminData.email || !adminData.password || !adminData.full_name || !adminData.sfd_id) {
      return new Response(
        JSON.stringify({ error: "Données d'admin incomplètes" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      return new Response(
        JSON.stringify({ error: "Format d'email invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate password strength
    if (adminData.password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if email already exists
    const { data: existingUsers, error: existingError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', adminData.email);
      
    if (existingError) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la vérification de l'email: ${existingError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ error: "Cet email est déjà utilisé par un autre administrateur" }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify SFD exists
    const { data: sfd, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', adminData.sfd_id)
      .single();
      
    if (sfdError || !sfd) {
      return new Response(
        JSON.stringify({ error: "SFD non trouvée ou invalide" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminData.full_name,
        sfd_id: adminData.sfd_id
      },
      app_metadata: {
        role: 'sfd_admin'
      }
    });
    
    if (authError || !authUser.user) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur auth: ${authError?.message || "Erreur inconnue"}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const newUserId = authUser.user.id;
    
    // Create admin_users entry
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: newUserId,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'sfd_admin',
        has_2fa: false
      });
      
    if (adminError) {
      // Attempt to clean up the auth user if admin_users insertion fails
      await supabase.auth.admin.deleteUser(newUserId);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur admin: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Assign SFD_ADMIN role
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: newUserId,
        role: 'sfd_admin'
      }
    );
    
    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Continue despite role assignment error, we'll log it
    }
    
    // Associate with SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: newUserId,
        sfd_id: adminData.sfd_id,
        is_default: true
      });
      
    if (assocError) {
      console.error("Error creating SFD association:", assocError);
      // Continue despite association error, we'll log it
    }
    
    // Log the creation in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'create_sfd_admin',
        category: 'ADMIN',
        severity: 'INFO',
        status: 'success',
        target_resource: 'admin_users/' + newUserId,
        details: {
          admin_id: newUserId,
          admin_email: adminData.email,
          sfd_id: adminData.sfd_id,
          sfd_name: sfd.name,
          created_by: user.id
        }
      });
    
    // Send notification email if requested
    if (adminData.notify) {
      // This could be implemented with another edge function or email service
      console.log("TODO: Send notification email to", adminData.email);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          id: newUserId,
          email: adminData.email,
          full_name: adminData.full_name,
          role: 'sfd_admin',
          sfd: {
            id: sfd.id,
            name: sfd.name
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
