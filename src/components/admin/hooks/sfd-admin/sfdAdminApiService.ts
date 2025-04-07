
import { supabase } from '@/integrations/supabase/client';

interface SfdAdminData {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string; 
  notify?: boolean;
}

// Récupérer la liste des administrateurs SFD
export async function fetchSfdAdmins() {
  try {
    console.log("Fetching SFD admins...");
    
    // Obtenir la liste des utilisateurs ayant le rôle sfd_admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'sfd_admin');
      
    if (roleError) {
      console.error("Error fetching SFD admin roles:", roleError);
      throw roleError;
    }
    
    if (!roleData || roleData.length === 0) {
      console.log("No SFD admin roles found");
      return [];
    }
    
    const userIds = roleData.map(item => item.user_id);
    
    // Récupérer les détails des utilisateurs administrateurs
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .in('id', userIds);
      
    if (adminError) {
      console.error("Error fetching SFD admin details:", adminError);
      throw adminError;
    }
    
    console.log(`Found ${adminData?.length || 0} SFD admins`);
    return adminData || [];
  } catch (error: any) {
    console.error("Error in fetchSfdAdmins:", error);
    throw new Error(`Erreur lors de la récupération des administrateurs SFD: ${error.message}`);
  }
}

// Créer un nouvel administrateur SFD
export async function createSfdAdmin(adminData: SfdAdminData) {
  try {
    console.log("Creating SFD admin:", { ...adminData, password: "***" });
    
    // 1. Créer un utilisateur avec l'API Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          full_name: adminData.full_name,
          role: 'sfd_admin',
          sfd_id: adminData.sfd_id // Important: stocker l'ID SFD dans les métadonnées utilisateur
        }
      }
    });

    if (signUpError) {
      console.error("Error signing up user:", signUpError);
      throw signUpError;
    }
    
    if (!signUpData.user) {
      throw new Error("Aucun utilisateur créé");
    }

    console.log("User created successfully:", signUpData.user.id);

    // 2. Créer une entrée dans admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: signUpData.user.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'sfd_admin',
        has_2fa: false
      });

    if (adminError) {
      console.error("Error creating admin user record:", adminError);
      throw adminError;
    }
    
    // 3. Association avec l'SFD spécifique via l'edge function
    const { data: linkData, error: linkError } = await supabase.functions.invoke(
      'create_sfd_admin_link', 
      {
        body: {
          admin_id: signUpData.user.id,
          sfd_id: adminData.sfd_id,
          is_primary: true // Premier admin ajouté est l'admin principal
        }
      }
    );
      
    if (linkError) {
      console.error("Error linking admin to SFD:", linkError);
      // Continuer malgré l'erreur, car l'association est aussi dans les métadonnées
    }

    // 4. Assigner le rôle SFD_ADMIN
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: signUpData.user.id,
        role: 'sfd_admin'
      }
    );

    if (roleError) {
      console.error("Error assigning role:", roleError);
      throw roleError;
    }

    console.log("SFD admin role assigned successfully");
    
    return {
      success: true,
      user_id: signUpData.user.id,
      email: adminData.email,
      full_name: adminData.full_name
    };
  } catch (error: any) {
    console.error("Error creating SFD admin:", error);
    throw new Error(`Erreur lors de la création de l'administrateur SFD: ${error.message}`);
  }
}

// Supprimer un administrateur SFD
export async function deleteSfdAdmin(adminId: string) {
  try {
    // Vérifier que l'utilisateur existe et est bien un admin SFD
    const { data: userData, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .eq('role', 'sfd_admin')
      .single();
      
    if (userError || !userData) {
      throw new Error("Administrateur SFD non trouvé");
    }
    
    // Supprimer l'entrée de la table admin_users
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);
      
    if (error) throw error;
    
    // Supprimer le rôle SFD_ADMIN
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', adminId)
      .eq('role', 'sfd_admin');
      
    if (roleError) {
      console.warn("Warning: Failed to delete role entry:", roleError);
      // Continuer malgré l'erreur
    }
    
    // Supprimer l'utilisateur de l'authentification Supabase si possible
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
    
    if (authError) {
      console.warn("Warning: Failed to delete auth user:", authError);
      // Continuer malgré l'erreur
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting SFD admin:", error);
    throw new Error(`Erreur lors de la suppression de l'administrateur SFD: ${error.message}`);
  }
}
