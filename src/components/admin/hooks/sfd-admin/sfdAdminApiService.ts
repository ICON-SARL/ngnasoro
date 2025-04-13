
import { supabase } from '@/integrations/supabase/client';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  created_at: string;
  last_sign_in_at: string;
}

export const addSfdAdmin = async (adminData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string;
  notify: boolean;
}) => {
  try {
    console.log('Attempting to create SFD admin with Edge Function');
    
    // Use Edge Function to create admin
    const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
      body: {
        adminData,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }

    if (data?.error) {
      console.error('Admin creation error:', data.error);
      throw new Error(data.error);
    }

    console.log('SFD admin created successfully:', data);
    return data;
  } catch (err: any) {
    console.error('Error in addSfdAdmin:', err);
    throw err;
  }
};

export const getSfdAdmins = async (): Promise<SfdAdmin[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'sfd_admin');
      
    if (error) throw error;
    
    return data || [];
  } catch (err: any) {
    console.error('Error fetching SFD admins:', err);
    throw new Error(`Erreur lors de la récupération des administrateurs: ${err.message}`);
  }
};

// Helper function to get SFD admins for a specific SFD
export const getSfdAdminsForSfd = async (sfdId: string): Promise<SfdAdmin[]> => {
  try {
    // First get all the user IDs associated with this SFD
    const { data: userSfds, error: sfdsError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId);
    
    if (sfdsError) throw sfdsError;
    
    if (!userSfds || userSfds.length === 0) {
      return []; // No users associated with this SFD
    }
    
    // Extract the user IDs
    const userIds = userSfds.map(record => record.user_id);
    
    // Now get admin_users that have the role 'sfd_admin' and are in the list of userIds
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'sfd_admin')
      .in('id', userIds);
      
    if (error) throw error;
    
    return data || [];
  } catch (err: any) {
    console.error(`Error fetching SFD admins for SFD ${sfdId}:`, err);
    throw new Error(`Erreur lors de la récupération des administrateurs SFD: ${err.message}`);
  }
};

export const deleteSfdAdmin = async (adminId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-sfd-admin', {
      body: { adminId },
    });
    
    if (error) throw error;
    
    return data;
  } catch (err: any) {
    console.error('Error deleting SFD admin:', err);
    throw new Error(`Erreur lors de la suppression: ${err.message}`);
  }
};
