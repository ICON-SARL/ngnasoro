
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

serve(async (req) => {
  console.log("Edge function create-sfd-with-admin started");
  
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
    
    const { sfdData, createAdmin, adminData } = requestBody;
    
    console.log("Processing request:", { 
      sfdName: sfdData?.name,
      sfdCode: sfdData?.code,
      createAdmin: createAdmin,
      adminEmail: adminData?.email ? adminData.email : 'none provided'
    });

    // Validate SFD data
    if (!sfdData || !sfdData.name || !sfdData.code) {
      return new Response(
        JSON.stringify({ error: "Données SFD insuffisantes. Nom et code requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate admin data if creating admin
    if (createAdmin && adminData) {
      if (!adminData.email || !adminData.password || !adminData.full_name) {
        return new Response(
          JSON.stringify({ error: "Données administrateur incomplètes" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!isValidEmail(adminData.email)) {
        return new Response(
          JSON.stringify({ error: "Format d'email invalide" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!isValidPassword(adminData.password)) {
        return new Response(
          JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if email is already in use
      const { data: existingUser, error: existingUserError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', adminData.email)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Cet email est déjà utilisé" }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create SFD
    const { data: newSfd, error: sfdError } = await supabase
      .from('sfds')
      .insert({
        name: sfdData.name,
        code: sfdData.code,
        region: sfdData.region || null,
        status: sfdData.status || 'active',
        description: sfdData.description || null,
        contact_email: sfdData.contact_email || null,
        phone: sfdData.phone || null,
        logo_url: sfdData.logo_url || null
      })
      .select()
      .single();

    if (sfdError) {
      // Check for unique constraint violation
      if (sfdError.code === '23505') {
        return new Response(
          JSON.stringify({ error: "Ce code SFD est déjà utilisé" }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error("Error creating SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de la SFD: ${sfdError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("SFD created successfully, ID:", newSfd.id);

    // Create SFD stats entry
    const { error: statsError } = await supabase
      .from('sfd_stats')
      .insert({
        sfd_id: newSfd.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0
      });

    if (statsError) {
      console.warn("Error creating SFD stats:", statsError);
    }

    // Create admin if requested
    let adminResult = null;
    if (createAdmin && adminData) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: adminData.email,
          password: adminData.password,
          email_confirm: true,
          user_metadata: {
            full_name: adminData.full_name,
            sfd_id: newSfd.id
          },
          app_metadata: {
            role: 'sfd_admin'
          }
        });

        if (authError || !authUser.user) {
          console.error("Error creating auth user:", authError);
          return new Response(
            JSON.stringify({ 
              error: `Erreur lors de la création de l'utilisateur: ${authError?.message || "Erreur inconnue"}`,
              sfd: newSfd
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const adminUserId = authUser.user.id;
        console.log("Auth user created with ID:", adminUserId);

        // Create admin_users entry
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            id: adminUserId,
            email: adminData.email,
            full_name: adminData.full_name,
            role: 'sfd_admin',
            has_2fa: false
          });

        if (adminError) {
          console.error("Error creating admin_user record:", adminError);
          return new Response(
            JSON.stringify({ 
              error: `Erreur lors de la création de l'enregistrement admin: ${adminError.message}`,
              sfd: newSfd
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Assign SFD_ADMIN role using RPC function
        const { error: roleError } = await supabase.rpc(
          'assign_role',
          {
            user_id: adminUserId,
            role: 'sfd_admin'
          }
        );

        if (roleError) {
          console.error("Error assigning role:", roleError);
          return new Response(
            JSON.stringify({ 
              error: `Erreur lors de l'attribution du rôle: ${roleError.message}`,
              sfd: newSfd
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create user-SFD association
        const { error: assocError } = await supabase
          .from('user_sfds')
          .insert({
            user_id: adminUserId,
            sfd_id: newSfd.id,
            is_default: true
          });

        if (assocError) {
          console.error("Error creating SFD association:", assocError);
          return new Response(
            JSON.stringify({ 
              error: `Erreur lors de la création de l'association SFD: ${assocError.message}`,
              sfd: newSfd
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        adminResult = {
          id: adminUserId,
          email: adminData.email,
          full_name: adminData.full_name,
          role: 'sfd_admin'
        };
      } catch (error: any) {
        console.error("Error during admin creation:", error);
        return new Response(
          JSON.stringify({ 
            error: `Erreur lors de la création de l'administrateur: ${error.message}`,
            sfd: newSfd
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        sfd: newSfd,
        admin: adminResult
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
