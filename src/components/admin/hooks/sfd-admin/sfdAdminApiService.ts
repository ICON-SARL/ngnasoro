
import { supabase } from '@/integrations/supabase/client';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';
import { UserRole } from '@/hooks/auth/types';

interface AdminUserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  sfd_id: string;
}

/**
 * Creates a new SFD admin user
 */
export async function createSfdAdmin(adminData: {
  email: string;
  password: string;
  full_name: string;
  sfd_id: string;
  notify: boolean;
}) {
  try {
    console.log("Starting SFD admin creation process");
    
    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', adminData.email);
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw new Error("Erreur lors de la vérification de l'email");
    }
    
    if (existingUsers && existingUsers.length > 0) {
      throw new Error("Cet email est déjà utilisé par un autre administrateur");
    }
    
    console.log("No existing user found with this email, proceeding with creation");
    
    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminData.full_name,
        sfd_id: adminData.sfd_id
      },
      app_metadata: {
        role: 'sfd_admin' as UserRole,
      }
    });
    
    if (authError) {
      console.error("Error creating auth user:", authError);
      throw new Error(`Erreur de création du compte: ${authError.message}`);
    }
    
    if (!authData.user) {
      throw new Error("Échec de création du compte utilisateur");
    }
    
    console.log('Auth user created:', authData.user.id);
    
    // 2. Ajouter l'entrée admin_users directement
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'sfd_admin',
        has_2fa: false
      });
    
    if (adminError) {
      console.error('Error creating admin user record:', adminError);
      throw new Error(`Erreur lors de l'ajout de l'administrateur: ${adminError.message}`);
    }
    
    // 3. Assigner le rôle dans la table user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'sfd_admin'
      });
    
    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Continue malgré l'erreur d'attribution de rôle, nous la gérerons séparément
    }
    
    // 4. Créer l'association avec la SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: authData.user.id,
        sfd_id: adminData.sfd_id,
        is_default: true
      });
      
    if (assocError) {
      console.error('Error creating SFD association:', assocError);
      throw new Error(`Erreur lors de l'association à la SFD: ${assocError.message}`);
    }
    
    // Enregistrer l'événement d'audit
    await logAuditEvent({
      category: AuditLogCategory.ADMIN_ACTION,
      action: 'sfd_admin_created',
      details: {
        email: adminData.email,
        sfd_id: adminData.sfd_id
      },
      user_id: authData.user.id,
      severity: AuditLogSeverity.INFO,
      status: 'success'
    });
    
    console.log('SFD admin creation completed successfully');
    return authData.user;
  } catch (error: any) {
    console.error('SFD admin creation failed:', error);
    throw error;
  }
}

/**
 * Deletes an SFD admin user
 */
export async function deleteSfdAdmin(adminId: string) {
  try {
    // 1. Supprimer l'association SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .delete()
      .eq('user_id', adminId);
      
    if (assocError) {
      console.error('Error removing SFD association:', assocError);
      // Continue anyway to ensure cleanup
    }
    
    // 2. Supprimer le rôle
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', adminId);
      
    if (roleError) {
      console.error('Error removing role:', roleError);
      // Continue anyway to ensure cleanup
    }
    
    // 3. Supprimer de admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);
      
    if (adminError) {
      console.error('Error deleting from admin_users:', adminError);
      throw adminError;
    }
    
    // 4. Supprimer l'utilisateur d'auth
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw authError;
    }
    
    // 5. Log audit event
    await logAuditEvent({
      category: AuditLogCategory.ADMIN_ACTION,
      action: 'sfd_admin_deleted',
      details: { admin_id: adminId },
      user_id: undefined,
      severity: AuditLogSeverity.WARNING,
      status: 'success'
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteSfdAdmin:', error);
    throw error;
  }
}

/**
 * Fetches all SFD admins
 */
export async function fetchSfdAdmins() {
  try {
    // Récupérer tous les administrateurs SFD et filtrer côté client
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'sfd_admin');
      
    if (error) {
      console.error('Error fetching SFD admins:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchSfdAdmins:', error);
    throw error;
  }
}

/**
 * Fetches SFD admins for a specific SFD
 */
export async function fetchSfdAdminsForSfd(sfdId: string) {
  try {
    // First get all user_ids associated with this SFD
    const { data: associations, error: assocError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId);
      
    if (assocError) {
      console.error('Error fetching SFD associations:', assocError);
      throw assocError;
    }
    
    if (!associations || associations.length === 0) {
      return [];
    }
    
    // Get all user IDs
    const userIds = associations.map(assoc => assoc.user_id);
    
    // Then get admin details for these users
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .in('id', userIds)
      .eq('role', 'sfd_admin');
      
    if (error) {
      console.error('Error fetching SFD admins by SFD:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchSfdAdminsForSfd:', error);
    throw error;
  }
}
