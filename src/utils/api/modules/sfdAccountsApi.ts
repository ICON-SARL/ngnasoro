
import { supabase } from "@/integrations/supabase/client";

export interface SfdCreateData {
  name: string;
  code: string;
  region?: string;
  status?: string;
  contact_email?: string;
  phone?: string;
  logo_url?: string;
  description?: string;
}

export interface AdminCreateData {
  email: string;
  password: string;
  full_name: string;
}

export interface AccountTypeData {
  types: string[];
}

export const sfdAccountsApi = {
  /**
   * Crée une SFD avec un administrateur et des comptes associés (transaction)
   */
  createSfdWithAdminAndAccounts: async (
    sfdData: SfdCreateData,
    adminData: AdminCreateData,
    accounts?: AccountTypeData
  ) => {
    try {
      console.log("Création d'une SFD avec admin et comptes:", {
        sfd: sfdData,
        adminInfo: { ...adminData, password: '******' }, // Masquer le mot de passe dans les logs
        accounts
      });

      const { data, error } = await supabase.functions.invoke('create-sfd-accounts', {
        body: JSON.stringify({
          sfdData,
          adminData,
          accounts
        })
      });

      if (error) {
        console.error("Erreur lors de l'appel à la fonction Edge:", error);
        throw new Error(`Erreur de serveur: ${error.message}`);
      }

      if (data?.error) {
        console.error("Erreur retournée par la fonction:", data.error);
        throw new Error(data.error);
      }

      return data;
    } catch (error: any) {
      console.error("Erreur lors de la création de SFD avec admin et comptes:", error);
      throw error;
    }
  }
};
