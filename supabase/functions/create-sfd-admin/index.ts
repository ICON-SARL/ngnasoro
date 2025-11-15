
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminData {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string;
  notify: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Création du client supabase avec le rôle service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Vérifier l'authentification de l'utilisateur
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé: token manquant' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé: token invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier si l'utilisateur est admin
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (roleError || !userRoles) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé: droits insuffisants' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Récupérer les données envoyées
    const { adminData }: { adminData: AdminData } = await req.json();
    
    console.log('Creating SFD admin:', { ...adminData, password: '***' });
    
    // Vérifier les données obligatoires
    if (!adminData.email || !adminData.password || !adminData.full_name || !adminData.sfd_id) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes pour créer l\'administrateur SFD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier si la SFD existe
    const { data: sfdExists, error: sfdError } = await supabaseAdmin
      .from('sfds')
      .select('id, name')
      .eq('id', adminData.sfd_id)
      .single();
    
    if (sfdError || !sfdExists) {
      return new Response(
        JSON.stringify({ error: 'SFD non trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 1. Créer l'utilisateur dans auth.users
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
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
    
    if (createUserError || !newUser.user) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur: ${createUserError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const newAdminId = newUser.user.id;
    
    try {
      // 2. Créer le profil dans profiles
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: newAdminId,
          full_name: adminData.full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      // 3. Assigner le rôle SFD_ADMIN
      await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newAdminId,
          role: 'sfd_admin'
        });
      
      // 4. Créer l'association avec la SFD
      await supabaseAdmin
        .from('user_sfds')
        .insert({
          user_id: newAdminId,
          sfd_id: adminData.sfd_id,
          is_default: true
        });
      
      // 5. Si notification demandée, envoyer un email (à implémenter)
      if (adminData.notify) {
        // Code d'envoi d'email à implémenter
        console.log(`Notification d'email à envoyer pour ${adminData.email}`);
      }
      
      // 6. Enregistrer un audit log
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: user.id, // L'administrateur qui a créé cet admin SFD
          action: 'create_sfd_admin',
          target_resource: `profiles/${newAdminId}`,
          category: 'ADMIN_OPERATIONS',
          severity: 'INFO',
          status: 'success',
          details: {
            sfd_id: adminData.sfd_id,
            sfd_name: sfdExists.name,
            admin_email: adminData.email,
            admin_name: adminData.full_name
          }
        });
      
      // Retourner les informations de l'administrateur créé
      return new Response(
        JSON.stringify({
          success: true,
          admin: {
            id: newAdminId,
            email: adminData.email,
            full_name: adminData.full_name,
            role: 'sfd_admin',
            sfd_id: adminData.sfd_id,
            sfd_name: sfdExists.name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // En cas d'erreur, essayer de supprimer l'utilisateur créé
      await supabaseAdmin.auth.admin.deleteUser(newAdminId);
      
      throw error;
    }
  } catch (error) {
    console.error('Erreur dans create-sfd-admin:', error);
    
    return new Response(
      JSON.stringify({ error: `Erreur interne du serveur: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
