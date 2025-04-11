
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
    console.log('Récupération de tous les administrateurs SFD');
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'sfd_admin');
      
    if (error) {
      console.error('Erreur lors de la récupération des administrateurs SFD:', error);
      throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
    }
    
    console.log('Administrateurs SFD récupérés avec succès:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('Erreur non gérée dans fetchSfdAdmins:', error);
    throw new Error(`Impossible de charger les administrateurs: ${error.message}`);
  }
}

export async function fetchSfdAdminsForSfd(sfdId: string): Promise<SfdAdmin[]> {
  try {
    console.log(`Récupération des administrateurs SFD pour la SFD ID: ${sfdId}`);
    
    // D'abord, récupérer les user_ids associés à cette SFD
    const { data: associations, error: assocError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId);
      
    if (assocError) {
      console.error('Erreur lors de la récupération des associations SFD:', assocError);
      throw new Error(`Erreur lors de la récupération des associations: ${assocError.message}`);
    }
    
    if (!associations || associations.length === 0) {
      console.log('Aucun administrateur associé à cette SFD');
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
      console.error('Erreur lors de la récupération des administrateurs SFD:', error);
      throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
    }
    
    console.log(`${data?.length || 0} administrateurs SFD récupérés pour la SFD ${sfdId}`);
    return data || [];
  } catch (error: any) {
    console.error(`Erreur non gérée dans fetchSfdAdminsForSfd pour la SFD ${sfdId}:`, error);
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
    console.log('Création d\'un administrateur SFD:', { 
      email: adminData.email, 
      full_name: adminData.full_name, 
      role: adminData.role, 
      sfd_id: adminData.sfd_id, 
      notify: adminData.notify 
    });
    
    // Utiliser la fonction Edge pour créer l'administrateur
    const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
      body: JSON.stringify(adminData)
    });
    
    if (error) {
      console.error('Erreur lors de l\'appel à la fonction create-sfd-admin:', error);
      throw new Error(`Erreur lors de la création de l'administrateur SFD: ${error.message}`);
    }
    
    if (!data || data.error) {
      console.error('Erreur dans la réponse de la fonction:', data?.error || 'Erreur inconnue');
      throw new Error(data?.error || 'Erreur inconnue lors de la création de l\'administrateur');
    }
    
    console.log('Administrateur SFD créé avec succès:', data);
    return data;
  } catch (error: any) {
    console.error('Erreur non gérée dans createSfdAdmin:', error);
    throw new Error(error.message || 'Erreur lors de la création de l\'administrateur SFD');
  }
}

export async function deleteSfdAdmin(adminId: string): Promise<void> {
  try {
    console.log(`Suppression de l'administrateur SFD avec l'ID: ${adminId}`);
    
    // Utiliser la fonction Edge pour supprimer l'administrateur
    const { data, error } = await supabase.functions.invoke('delete-sfd-admin', {
      body: JSON.stringify({ adminId })
    });
    
    if (error) {
      console.error('Erreur lors de l\'appel à la fonction delete-sfd-admin:', error);
      throw new Error(`Erreur lors de la suppression de l'administrateur SFD: ${error.message}`);
    }
    
    if (!data || data.error) {
      console.error('Erreur dans la réponse de la fonction:', data?.error || 'Erreur inconnue');
      throw new Error(data?.error || 'Erreur inconnue lors de la suppression de l\'administrateur');
    }
    
    console.log('Administrateur SFD supprimé avec succès');
  } catch (error: any) {
    console.error('Erreur non gérée dans deleteSfdAdmin:', error);
    throw new Error(error.message || 'Erreur lors de la suppression de l\'administrateur SFD');
  }
}
