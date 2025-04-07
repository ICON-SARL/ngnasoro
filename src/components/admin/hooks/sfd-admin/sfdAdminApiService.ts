
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
    
    // 1. Vérifier que la SFD existe
    const { data: sfdCheck, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', userData.sfd_id)
      .single();
      
    if (sfdError || !sfdCheck) {
      throw new Error(`La SFD avec l'ID ${userData.sfd_id} n'existe pas ou n'est pas accessible`);
    }
    
    console.log("SFD vérifiée:", sfdCheck.name);
    
    // 2. Vérifier si l'e-mail est déjà utilisé
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();
      
    if (existingUser) {
      throw new Error("Cet e-mail est déjà associé à un compte administrateur. Veuillez utiliser une autre adresse e-mail.");
    }
    
    // 3. Créer un utilisateur avec l'API Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: 'sfd_admin',
          sfd_id: userData.sfd_id
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

    // 4. Utiliser la fonction Edge pour créer l'entrée dans admin_users et associer à la SFD
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
