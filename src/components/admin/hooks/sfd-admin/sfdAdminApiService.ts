
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

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
    
    // Use the edge function API instead of direct query to avoid recursion issues
    const data = await edgeFunctionApi.callEdgeFunction('fetch-sfd-admins', {});
      
    if (!data || data.error) {
      console.error('Erreur lors de la récupération des administrateurs SFD:', data?.error || 'Erreur inconnue');
      throw new Error(`Erreur lors de la récupération des administrateurs: ${data?.error || 'Erreur inconnue'}`);
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
    
    // Use the edge function API
    const data = await edgeFunctionApi.callEdgeFunction('fetch-sfd-admins', { sfdId });
      
    if (!data || data.error) {
      console.error('Erreur lors de la récupération des administrateurs SFD:', data?.error || 'Erreur inconnue');
      throw new Error(`Erreur lors de la récupération des administrateurs: ${data?.error || 'Erreur inconnue'}`);
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
    const data = await edgeFunctionApi.callEdgeFunction('create-sfd-admin', adminData);
    
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
    const data = await edgeFunctionApi.callEdgeFunction('delete-sfd-admin', { adminId });
    
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
