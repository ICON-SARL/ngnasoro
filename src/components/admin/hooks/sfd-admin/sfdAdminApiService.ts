
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

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
    // Utiliser l'API helper pour gérer les erreurs et les retries
    const admins = await edgeFunctionApi.callEdgeFunction('fetch-sfd-admins');
    return Array.isArray(admins) ? admins : [];
  } catch (error: any) {
    console.error('Erreur dans fetchSfdAdmins:', error);
    // Retourner un tableau vide au lieu de propager l'erreur
    return [];
  }
};

export const fetchSfdAdminsForSfd = async (sfdId: string): Promise<SfdAdmin[]> => {
  try {
    if (!sfdId) {
      console.error('ID SFD manquant dans fetchSfdAdminsForSfd');
      return [];
    }
    
    // Utiliser l'API helper avec meilleure gestion des erreurs
    const admins = await edgeFunctionApi.callEdgeFunction('fetch-sfd-admins', { sfdId });
    return Array.isArray(admins) ? admins : [];
  } catch (error: any) {
    console.error(`Erreur dans fetchSfdAdminsForSfd (${sfdId}):`, error);
    // Retourner un tableau vide au lieu de propager l'erreur
    return [];
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
    console.log('Tentative de création de SFD admin avec les données:', {
      ...data,
      password: '******' // Ne pas logger le mot de passe réel
    });
    
    const response = await supabase.functions.invoke('create-sfd-admin', {
      body: JSON.stringify(data)
    });
    
    if (response.error) {
      console.error(`Erreur lors de la création de l'administrateur:`, response.error);
      
      // Vérifier les cas d'erreur spécifiques
      const errorMessage = response.error.message || "Une erreur s'est produite lors de la communication avec le serveur";
      
      // Améliorer la gestion des erreurs spécifiques
      if (errorMessage.includes('non-2xx status')) {
        // Si nous avons une erreur HTTP de la fonction Edge
        try {
          // Tenter d'extraire le message d'erreur du corps de la réponse Edge
          const match = errorMessage.match(/Edge Function returned an error: (.+)/);
          if (match && match[1]) {
            throw new Error(match[1]);
          }
          
          // Cas particulier: email déjà utilisé
          if (errorMessage.includes('already registered') || errorMessage.includes('already been registered')) {
            throw new Error("Cet email est déjà utilisé par un autre compte. Veuillez utiliser une autre adresse email.");
          }
        } catch (parseError) {
          // Si l'extraction échoue, utiliser le message d'erreur original
        }
      }
      
      throw new Error(errorMessage);
    }
    
    if (response.data?.error) {
      console.error(`Erreur retournée par le serveur:`, response.data.error);
      
      const errorMsg = response.data.error;
      if (typeof errorMsg === 'string' && 
          (errorMsg.includes('already registered') || 
           errorMsg.includes('already been registered') || 
           errorMsg.includes('déjà utilisé'))) {
        throw new Error("Cet email est déjà utilisé par un autre compte. Veuillez utiliser une autre adresse email.");
      }
      
      throw new Error(response.data.error);
    }
    
    if (!response.data?.user) {
      console.error(`Réponse inattendue:`, response.data);
      throw new Error("Réponse invalide du serveur");
    }
    
    console.log('Administrateur SFD créé avec succès:', response.data.user);
    return response.data.user;
  } catch (error: any) {
    console.error(`Erreur dans addSfdAdmin:`, error);
    
    // Formater les messages d'erreur courants pour une meilleure expérience utilisateur
    if (error.message?.includes('already registered') || 
        error.message?.includes('already been registered') || 
        error.message?.includes('déjà utilisé')) {
      throw new Error("Cet email est déjà utilisé par un autre compte. Veuillez utiliser une autre adresse email.");
    }
    
    throw error;
  }
};
