
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation function
function isValidPassword(password: string): boolean {
  // At least 8 characters, contains uppercase, lowercase and a number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
}

serve(async (req) => {
  console.log("Edge function create-sfd-with-admin started");
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header to validate permissions
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Requête non autorisée - Pas d'en-tête d'autorisation" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte - Variables d'environnement manquantes" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create Supabase client with the provided JWT for permission verification
    const clientToken = authHeader.replace('Bearer ', '');
    const clientSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${clientToken}`
        }
      }
    });
    
    console.log("Supabase clients created");

    // Verify user identity and permissions
    let userId;
    try {
      // Get user ID from JWT token
      const { data: { user }, error: userError } = await supabase.auth.getUser(clientToken);
      
      if (userError || !user) {
        console.error("JWT verification error:", userError);
        return new Response(
          JSON.stringify({ error: `Erreur d'authentification: ${userError?.message || "Utilisateur non identifié"}` }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = user.id;
      console.log("User identified:", userId);
      
      // Check if user has admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        return new Response(
          JSON.stringify({ error: `Erreur lors de la vérification des rôles: ${rolesError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const hasAdminRole = roles?.some(r => r.role === 'admin');
      console.log("User has admin role:", hasAdminRole);
      
      if (!hasAdminRole) {
        return new Response(
          JSON.stringify({ error: "Vous n'avez pas les permissions nécessaires pour créer une SFD" }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (authError: any) {
      console.error("Auth verification error:", authError);
      return new Response(
        JSON.stringify({ error: `Erreur d'authentification: ${authError.message}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed");
    } catch (parseError: any) {
      console.error("JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({ error: "Format de données invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { sfdData, createAdmin, adminData } = requestBody;
    console.log("Processing request data:", { 
      sfdName: sfdData?.name,
      sfdCode: sfdData?.code,
      createAdmin: createAdmin,
      adminEmail: adminData?.email ? adminData.email : 'none provided'
    });

    // Validate SFD data
    if (!sfdData || !sfdData.name || !sfdData.code) {
      console.error("Missing SFD data:", sfdData);
      return new Response(
        JSON.stringify({ error: "Données SFD insuffisantes. Nom et code requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate admin data if creating admin
    if (createAdmin && adminData) {
      console.log("Validating admin data");
      
      if (!adminData.email || !adminData.password || !adminData.full_name) {
        console.error("Incomplete admin data");
        return new Response(
          JSON.stringify({ error: "Données administrateur incomplètes" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!isValidEmail(adminData.email)) {
        console.error("Invalid email:", adminData.email);
        return new Response(
          JSON.stringify({ error: "Format d'email invalide" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!isValidPassword(adminData.password)) {
        console.error("Password doesn't meet requirements");
        return new Response(
          JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if email is already in use
      const { data: existingUser, error: existingUserError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', adminData.email)
        .maybeSingle();

      if (existingUserError) {
        console.error("Error checking existing email:", existingUserError);
      } else if (existingUser) {
        console.error("Email already in use:", adminData.email);
        return new Response(
          JSON.stringify({ error: "Cet email est déjà utilisé. Veuillez utiliser une autre adresse email." }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    try {
      console.log("Starting SFD creation transaction");
      
      // 1. Create SFD
      console.log("Creating SFD record");
      const { data: newSfd, error: sfdError } = await supabase
        .from('sfds')
        .insert([sfdData])
        .select()
        .single();

      if (sfdError) {
        console.error("Error creating SFD:", sfdError);
        
        // Check for constraint violations
        if (sfdError.code === '23505') {
          if (sfdError.message.includes('code')) {
            return new Response(
              JSON.stringify({ error: "Ce code SFD est déjà utilisé" }),
              { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            return new Response(
              JSON.stringify({ error: "Un élément unique est déjà utilisé" }),
              { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ error: `Erreur lors de la création de la SFD: ${sfdError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("SFD created successfully, ID:", newSfd.id);

      // 2. Create statistics entry for the new SFD
      console.log("Creating SFD statistics");
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
      } else {
        console.log("SFD stats created");
      }

      // 3. Create admin if requested
      let adminResult = null;
      if (createAdmin && adminData) {
        console.log("Creating SFD admin");
        
        try {
          // Create auth user with email confirmation disabled
          console.log("Creating auth user");
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

          if (authError) {
            console.error("Auth user creation error:", authError);
            return new Response(
              JSON.stringify({ 
                error: `Erreur lors de la création de l'utilisateur: ${authError.message}`,
                sfd: newSfd
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (!authUser?.user) {
            console.error("No user created");
            return new Response(
              JSON.stringify({ 
                error: "Échec de création de l'utilisateur admin",
                sfd: newSfd
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const adminUserId = authUser.user.id;
          console.log("Auth user created with ID:", adminUserId);

          // Create admin_users entry
          console.log("Creating admin_users record");
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
          console.log("admin_users record created");

          // Assign SFD_ADMIN role
          console.log("Assigning sfd_admin role");
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
          console.log("sfd_admin role assigned");

          // Create user-SFD association
          console.log("Creating user-SFD association");
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
          console.log("SFD association created");

          adminResult = {
            id: adminUserId,
            email: adminData.email,
            full_name: adminData.full_name,
            role: 'sfd_admin'
          };
          
          console.log("SFD admin created successfully:", adminResult);
        } catch (adminCreateError: any) {
          console.error("Unhandled error during admin creation:", adminCreateError);
          return new Response(
            JSON.stringify({ 
              error: `Erreur lors de la création de l'administrateur: ${adminCreateError.message}`,
              sfd: newSfd 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Return success response
      console.log("Operation completed successfully");
      return new Response(
        JSON.stringify({
          success: true,
          sfd: newSfd,
          admin: adminResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error: any) {
      console.error("Unhandled error in main process:", error);
      return new Response(
        JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error("Top-level error:", error);
    return new Response(
      JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
