
import { supabase } from '@/integrations/supabase/client';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  last_sign_in_at?: string;
}

export const fetchSfdAdmins = async (): Promise<SfdAdmin[]> => {
  try {
    const { data: admins, error } = await supabase.functions.invoke('fetch-sfd-admins');
    
    if (error) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
      throw new Error(error.message);
    }
    
    return admins || [];
  } catch (error: any) {
    console.error('Erreur dans fetchSfdAdmins:', error);
    throw error;
  }
};

export const fetchSfdAdminsForSfd = async (sfdId: string): Promise<SfdAdmin[]> => {
  try {
    const { data: admins, error } = await supabase.functions.invoke('fetch-sfd-admins', {
      body: JSON.stringify({ sfdId })
    });
    
    if (error) {
      console.error(`Erreur lors de la récupération des administrateurs pour SFD ${sfdId}:`, error);
      throw new Error(error.message);
    }
    
    return admins || [];
  } catch (error: any) {
    console.error(`Erreur dans fetchSfdAdminsForSfd (${sfdId}):`, error);
    throw error;
  }
};

export const deleteSfdAdmin = async (adminId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-sfd-admin', {
      body: JSON.stringify({ adminId })
    });
    
    if (error) {
      console.error(`Erreur lors de la suppression de l'administrateur ${adminId}:`, error);
      throw new Error(error.message);
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Erreur dans deleteSfdAdmin (${adminId}):`, error);
    throw error;
  }
};

export const addSfdAdmin = async (data: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string;
  notify: boolean;
}): Promise<SfdAdmin> => {
  try {
    const response = await supabase.functions.invoke('create-sfd-admin', {
      body: JSON.stringify(data)
    });
    
    if (response.error) {
      console.error(`Erreur lors de la création de l'administrateur:`, response.error);
      throw new Error(response.error.message);
    }
    
    if (response.data?.error) {
      throw new Error(response.data.error);
    }
    
    return response.data?.user;
  } catch (error: any) {
    console.error(`Erreur dans addSfdAdmin:`, error);
    throw error;
  }
};
