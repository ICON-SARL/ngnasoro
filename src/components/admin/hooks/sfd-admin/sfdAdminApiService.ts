
import { supabase } from '@/integrations/supabase/client';

interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
}

export async function fetchSfdAdmins(): Promise<SfdAdmin[]> {
  try {
    console.log('Fetching all SFD admins');
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'sfd_admin');
      
    if (error) {
      console.error('Error fetching SFD admins:', error);
      throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unhandled error in fetchSfdAdmins:', error);
    throw new Error(`Impossible de charger les administrateurs: ${error.message}`);
  }
}

export async function fetchSfdAdminsForSfd(sfdId: string): Promise<SfdAdmin[]> {
  try {
    console.log(`Fetching SFD admins for SFD ID: ${sfdId}`);
    
    // D'abord, récupérer les user_ids associés à cette SFD
    const { data: associations, error: assocError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId);
      
    if (assocError) {
      console.error('Error fetching SFD associations:', assocError);
      throw new Error(`Erreur lors de la récupération des associations: ${assocError.message}`);
    }
    
    if (!associations || associations.length === 0) {
      console.log('No admins associated with this SFD');
      return [];
    }
    
    // Extraire les IDs d'utilisateur
    const userIds = associations.map(assoc => assoc.user_id);
    
    // Récupérer les détails des admins
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'sfd_admin')
      .in('id', userIds);
      
    if (error) {
      console.error('Error fetching SFD admins:', error);
      throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    console.error(`Unhandled error in fetchSfdAdminsForSfd for SFD ${sfdId}:`, error);
    throw new Error(`Impossible de charger les administrateurs: ${error.message}`);
  }
}

export async function createSfdAdmin(adminData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string;
  notify: boolean;
}): Promise<any> {
  try {
    console.log('Creating SFD admin:', { ...adminData, password: '******' });
    
    // Utiliser la fonction edge pour créer l'admin
    const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
      body: JSON.stringify(adminData)
    });
    
    if (error) {
      console.error('Error invoking create-sfd-admin function:', error);
      throw new Error(`Erreur lors de la création de l'administrateur SFD: ${error.message}`);
    }
    
    if (!data || data.error) {
      console.error('Error in function response:', data?.error || 'Unknown error');
      throw new Error(data?.error || 'Erreur inconnue lors de la création de l\'administrateur');
    }
    
    console.log('SFD admin created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Unhandled error in createSfdAdmin:', error);
    throw new Error(error.message || 'Erreur lors de la création de l\'administrateur SFD');
  }
}

export async function deleteSfdAdmin(adminId: string): Promise<void> {
  try {
    console.log(`Deleting SFD admin with ID: ${adminId}`);
    
    // Utiliser la fonction edge pour supprimer l'admin
    const { data, error } = await supabase.functions.invoke('delete-sfd-admin', {
      body: JSON.stringify({ adminId })
    });
    
    if (error) {
      console.error('Error invoking delete-sfd-admin function:', error);
      throw new Error(`Erreur lors de la suppression de l'administrateur SFD: ${error.message}`);
    }
    
    if (!data || data.error) {
      console.error('Error in function response:', data?.error || 'Unknown error');
      throw new Error(data?.error || 'Erreur inconnue lors de la suppression de l\'administrateur');
    }
    
    console.log('SFD admin deleted successfully');
  } catch (error: any) {
    console.error('Unhandled error in deleteSfdAdmin:', error);
    throw new Error(error.message || 'Erreur lors de la suppression de l\'administrateur SFD');
  }
}
