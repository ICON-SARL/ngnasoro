
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
    
    // Vérifier que la SFD existe
    const { data: sfdCheck, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', userData.sfd_id)
      .single();
      
    if (sfdError || !sfdCheck) {
      throw new Error(`La SFD avec l'ID ${userData.sfd_id} n'existe pas ou n'est pas accessible`);
    }
    
    console.log("SFD vérifiée:", sfdCheck.name);
    
    // Vérifier si l'e-mail est déjà utilisé
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();
      
    if (existingUser) {
      throw new Error("Cet e-mail est déjà associé à un compte administrateur. Veuillez utiliser une autre adresse e-mail.");
    }
    
    // Utiliser la fonction Edge pour créer l'administrateur SFD
    console.log("Calling create_sfd_admin edge function");
    
    const { data: result, error } = await supabase.functions.invoke('create_sfd_admin', {
      body: {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        role: 'sfd_admin',
        sfd_id: userData.sfd_id
      }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Erreur lors de la création de l'administrateur SFD: ${error.message}`);
    }
    
    if (!result || !result.success) {
      const errorMsg = result?.error || "Échec de la création de l'administrateur SFD";
      console.error("Failed to create SFD admin:", errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log("SFD admin created successfully:", result);
    
    return {
      success: true,
      user_id: result.user_id,
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
    console.log("Deleting SFD admin:", adminId);
    
    // Vérifier que l'utilisateur existe et est bien un admin SFD
    const { data: userData, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single();
      
    if (userError) {
      throw new Error(`Administrateur non trouvé: ${userError.message}`);
    }
    
    if (!userData || userData.role !== 'sfd_admin') {
      throw new Error("L'utilisateur n'est pas un administrateur SFD");
    }
    
    // Utiliser la fonction Edge pour supprimer l'administrateur
    const { data: result, error } = await supabase.functions.invoke('delete_sfd_admin', {
      body: { admin_id: adminId }
    });
    
    if (error) {
      console.error("Error deleting admin user:", error);
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting SFD admin:", error);
    throw new Error(`Erreur lors de la suppression de l'administrateur SFD: ${error.message}`);
  }
}
