
import { supabase } from '@/integrations/supabase/client';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  last_sign_in_at: string | null;
}

export const sfdAdminApiService = {
  fetchSfdAdmins: async (sfdId: string): Promise<SfdAdmin[]> => {
    try {
      console.log(`Récupération des administrateurs pour la SFD: ${sfdId}`);
      
      // Récupérer directement les administrateurs avec le rôle sfd_admin
      // Au lieu d'utiliser Edge Function qui semble échouer
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, has_2fa, last_sign_in_at')
        .eq('role', 'sfd_admin');
      
      if (error) {
        console.error('Erreur lors de la récupération des administrateurs:', error);
        throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
      }
      
      return admins || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
      throw new Error('Impossible de récupérer les administrateurs SFD');
    }
  },
  
  createSfdAdmin: async (adminData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify?: boolean;
  }): Promise<any> => {
    // Appeler l'Edge Function pour créer l'administrateur SFD
    const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
      body: JSON.stringify({ adminData })
    });
    
    if (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
      throw new Error('Impossible de créer l\'administrateur SFD');
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
    
    return data;
  },
  
  deleteSfdAdmin: async (adminId: string): Promise<any> => {
    // Appeler l'Edge Function pour supprimer l'administrateur SFD
    const { data, error } = await supabase.functions.invoke('delete-sfd-admin', {
      body: JSON.stringify({ adminId })
    });
    
    if (error) {
      console.error('Erreur lors de la suppression de l\'administrateur:', error);
      throw new Error('Impossible de supprimer l\'administrateur SFD');
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
    
    return data;
  }
};

// Export the individual functions for direct import
export const { fetchSfdAdmins, createSfdAdmin, deleteSfdAdmin } = sfdAdminApiService;
