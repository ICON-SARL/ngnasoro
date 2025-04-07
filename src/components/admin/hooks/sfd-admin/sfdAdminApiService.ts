
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
export async function createSfdAdmin(userData: SfdAdminData) {
  try {
    console.log("Creating SFD admin:", { ...userData, password: "***" });
    
    // 1. Créer un utilisateur avec l'API Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: 'sfd_admin',
          sfd_id: userData.sfd_id // Important: stocker l'ID SFD dans les métadonnées utilisateur
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

    // 2. Utiliser la fonction Edge pour créer l'entrée dans admin_users et associer à la SFD
    // Cette approche contourne la RLS et gère toutes les opérations côté serveur
    const { data: edgeFunctionData, error: adminError } = await supabase.functions.invoke(
      'create_sfd_admin',
      {
        body: {
          admin_id: signUpData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: 'sfd_admin',
          sfd_id: userData.sfd_id,
          is_primary: true
        }
      }
    );

    if (adminError) {
      console.error("Error creating admin user record:", adminError);
      throw adminError;
    }
    
    console.log("Admin user record created successfully via edge function");

    return {
      success: true,
      user_id: signUpData.user.id,
      email: userData.email,
      full_name: userData.full_name,
      sfd_id: userData.sfd_id
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
    
    // Utiliser une edge function pour supprimer l'administrateur
    // afin de contourner les problèmes de RLS
    const { error } = await supabase.functions.invoke(
      'delete_sfd_admin',
      { body: { admin_id: adminId } }
    );
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting SFD admin:", error);
    throw new Error(`Erreur lors de la suppression de l'administrateur SFD: ${error.message}`);
  }
}
