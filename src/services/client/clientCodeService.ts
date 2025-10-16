import { supabase } from '@/integrations/supabase/client';

/**
 * Service pour gérer les codes clients
 */

export const clientCodeService = {
  /**
   * Génère un code client unique pour une SFD
   */
  generateClientCode: async (sfdId: string): Promise<string | null> => {
    try {
      // Récupérer le code de la SFD
      const { data: sfd, error: sfdError } = await supabase
        .from('sfds')
        .select('code')
        .eq('id', sfdId)
        .single();

      if (sfdError || !sfd) {
        console.error('Error fetching SFD code:', sfdError);
        return null;
      }

      // Utiliser la fonction RPC pour générer le code
      const { data, error } = await supabase
        .rpc('generate_client_code', { sfd_code: sfd.code });

      if (error) {
        console.error('Error generating client code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in generateClientCode:', error);
      return null;
    }
  },

  /**
   * Assigne un code client à un utilisateur
   */
  assignClientCode: async (userId: string, clientCode: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ client_code: clientCode })
        .eq('id', userId);

      if (error) {
        console.error('Error assigning client code to profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignClientCode:', error);
      return false;
    }
  },

  /**
   * Récupère le code client d'un utilisateur
   */
  getClientCode: async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('client_code')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.client_code || null;
    } catch (error) {
      console.error('Error in getClientCode:', error);
      return null;
    }
  },

  /**
   * Recherche un client par son code
   */
  lookupClientByCode: async (clientCode: string) => {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select(`
          *,
          profiles!inner(full_name, phone, client_code)
        `)
        .eq('client_code', clientCode)
        .single();

      if (error) {
        console.error('Error looking up client by code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in lookupClientByCode:', error);
      return null;
    }
  }
};
