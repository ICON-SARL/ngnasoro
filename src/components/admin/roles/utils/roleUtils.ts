
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/hooks/auth/types';
import { toast } from '@/hooks/use-toast';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export async function fetchUsers(): Promise<UserWithRole[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: 'Erreur',
      description: "Impossible de charger les utilisateurs",
      variant: 'destructive',
    });
    return [];
  }
}

export async function assignRoleToUser(email: string, selectedRole: UserRole): Promise<boolean> {
  if (!email) {
    toast({
      title: 'Erreur',
      description: "L'adresse email est requise",
      variant: 'destructive',
    });
    return false;
  }

  try {
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    let userId: string;
    let authUser: any;

    if (userError) {
      // User not found in admin_users table, look in auth.users (administrators only)
      const { data, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });

      if (authError || !data.users) {
        throw new Error('Impossible de récupérer la liste des utilisateurs');
      }

      // Find user with matching email
      authUser = data.users.find(u => u.email === email);
      
      if (!authUser) {
        throw new Error('Utilisateur non trouvé');
      }

      userId = authUser.id;

      // Update user's role in app_metadata
      const { error: updateError } = await supabase
        .auth.admin.updateUserById(userId, {
          app_metadata: { role: selectedRole }
        });

      if (updateError) throw updateError;

      // Create or update record in admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          id: userId,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || email.split('@')[0],
          role: selectedRole
        });

      if (adminError) throw adminError;
    } else {
      // User found in admin_users, update their role
      userId = userData.id;

      // Update user's role in app_metadata
      const { error: updateError } = await supabase
        .auth.admin.updateUserById(userId, {
          app_metadata: { role: selectedRole }
        });

      if (updateError) throw updateError;

      // Update record in admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .update({ role: selectedRole })
        .eq('id', userId);

      if (adminError) throw adminError;
    }

    // Call the assign_role function for both cases
    const { error: roleError } = await supabase.rpc('assign_role', {
      user_id: userId,
      role: selectedRole
    });

    if (roleError) throw roleError;

    toast({
      title: 'Rôle attribué',
      description: `Le rôle ${selectedRole} a été attribué à ${email}`,
    });

    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    toast({
      title: 'Erreur',
      description: error.message || "Impossible d'attribuer le rôle",
      variant: 'destructive',
    });
    return false;
  }
}
