
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
  // Set a timeout for the entire function (60 seconds)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Function timeout exceeded")), 60000);
  });

  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    console.log("Edge function started");
    
    // Get auth header to validate permissions
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Requête non autorisée" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Vérification des variables d'environnement
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authClient = supabase.auth.admin;

    // Extract JWT token
    const jwt = authHeader.replace('Bearer ', '');
    console.log("JWT token received");

    // Verify JWT token and get user information
    try {
      const { data: jwtData, error: jwtError } = await authClient.getUser(jwt);
      
      if (jwtError) {
        console.error("JWT verification error:", jwtError);
        return new Response(
          JSON.stringify({ error: `Erreur d'authentification: ${jwtError.message}` }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const userId = jwtData?.user?.id;
      console.log("Authenticated user ID:", userId);
      
      if (!userId) {
        console.error("No user ID found in JWT");
        return new Response(
          JSON.stringify({ error: "Token d'authentification invalide" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify user has admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        return new Response(
          JSON.stringify({ error: `Erreur lors de la vérification des permissions: ${rolesError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const isAdmin = roles?.some(r => r.role === 'admin');
      
      if (!isAdmin) {
        console.error("User does not have admin role:", userId);
        return new Response(
          JSON.stringify({ error: "Vous n'avez pas les permissions nécessaires pour créer une SFD" }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log("Admin permissions verified");
    } catch (authError) {
      console.error("Auth verification error:", authError);
      return new Response(
        JSON.stringify({ error: `Erreur d'authentification: ${authError.message}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupération du corps de la requête
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({ error: "Format de données invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { sfdData, adminData } = requestBody;

    console.log("Request data received:", JSON.stringify({
      sfdData: { ...sfdData, password: adminData?.password ? '******' : undefined },
      adminDataPresent: !!adminData
    }));
    
    // Vérification des données SFD
    if (!sfdData || !sfdData.name || !sfdData.code) {
      console.error("Insufficient SFD data:", sfdData);
      return new Response(
        JSON.stringify({ error: "Données SFD insuffisantes. Nom et code requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérification des données administrateur
    if (adminData) {
      if (!adminData.email || !adminData.password || !adminData.full_name) {
        console.error("Insufficient admin data");
        return new Response(
          JSON.stringify({ error: "Données administrateur incomplètes" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validation de l'email
      if (!isValidEmail(adminData.email)) {
        console.error("Invalid email format:", adminData.email);
        return new Response(
          JSON.stringify({ error: "Format d'email invalide" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validation du mot de passe
      if (!isValidPassword(adminData.password)) {
        console.error("Weak password");
        return new Response(
          JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Race the main logic against the timeout
    const mainLogicPromise = async () => {
      try {
        // 1. Créer la SFD
        console.log("Creating SFD:", sfdData.name);
        const { data: newSfd, error: sfdError } = await supabase
          .from('sfds')
          .insert([sfdData])
          .select()
          .single();

        if (sfdError) {
          console.error("Error creating SFD:", sfdError);
          
          // Check for constraint violations to provide better error messages
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

        // 2. Créer une entrée de statistiques pour la nouvelle SFD
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
          console.warn("Error creating statistics:", statsError);
          // Continuer malgré l'erreur
        }

        // 3. Si des données d'admin sont fournies, créer l'administrateur
        let adminResult = null;
        if (adminData && adminData.email && adminData.password && adminData.full_name) {
          console.log("Creating SFD admin for:", adminData.email);
          
          try {
            // Vérifier si l'utilisateur existe déjà
            console.log("Checking if email already exists");
            const { data: existingUser, error: existingUserError } = await supabase
              .from('admin_users')
              .select('id, email')
              .eq('email', adminData.email)
              .maybeSingle();

            if (existingUserError) {
              console.error("Error checking email:", existingUserError);
            }

            if (existingUser) {
              console.error("Email already used:", adminData.email);
              return new Response(
                JSON.stringify({ 
                  error: "Cet email est déjà utilisé. Veuillez utiliser une autre adresse email.",
                  sfd: newSfd
                }),
                { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            // Créer l'utilisateur dans auth.users
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
              console.error("Error creating auth user:", authError);
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

            const userId = authUser.user.id;
            console.log("Auth user created with ID:", userId);

            // Créer l'entrée admin_users
            console.log("Creating admin_users entry");
            const { error: adminError } = await supabase
              .from('admin_users')
              .insert({
                id: userId,
                email: adminData.email,
                full_name: adminData.full_name,
                role: 'sfd_admin',
                has_2fa: false
              });

            if (adminError) {
              console.error("Error creating admin_user:", adminError);
              // On continue malgré l'erreur pour essayer de terminer le processus
            } else {
              console.log("admin_users record created");
            }

            // Assigner le rôle SFD_ADMIN
            console.log("Assigning sfd_admin role");
            const { error: roleError } = await supabase.rpc(
              'assign_role',
              {
                user_id: userId,
                role: 'sfd_admin'
              }
            );

            if (roleError) {
              console.error("Error assigning role:", roleError);
              // On continue malgré l'erreur
            } else {
              console.log("sfd_admin role assigned");
            }

            // Créer l'association avec la SFD
            console.log("Creating user-SFD association");
            const { error: assocError } = await supabase
              .from('user_sfds')
              .insert({
                user_id: userId,
                sfd_id: newSfd.id,
                is_default: true
              });

            if (assocError) {
              console.error("Error creating SFD association:", assocError);
              // On continue malgré l'erreur
            } else {
              console.log("SFD association created");
            }

            adminResult = {
              id: userId,
              email: adminData.email,
              full_name: adminData.full_name,
              role: 'sfd_admin'
            };
            
            console.log("SFD admin creation completed successfully");
          } catch (adminCreateError) {
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

        // 4. Retourner le résultat
        console.log("Operation completed successfully");
        return new Response(
          JSON.stringify({
            success: true,
            sfd: newSfd,
            admin: adminResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Unhandled error:", error);
        return new Response(
          JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    };

    // Race the main logic against the timeout
    return await Promise.race([mainLogicPromise(), timeoutPromise]);

  } catch (error) {
    console.error("Top-level error:", error);
    
    if (error.message === "Function timeout exceeded") {
      return new Response(
        JSON.stringify({ error: "Délai d'attente dépassé. Veuillez réessayer." }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
