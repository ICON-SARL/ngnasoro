import { supabase } from '@/integrations/supabase/client';
import { KYC_LIMITS } from '@/types/client';

/**
 * Service pour gérer les niveaux KYC des clients
 */

export const kycService = {
  /**
   * Récupère le niveau KYC d'un client
   */
  getClientKYCLevel: async (clientId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('kyc_level')
        .eq('id', clientId)
        .single();

      if (error || !data) {
        return 1; // Niveau par défaut
      }

      return data.kyc_level || 1;
    } catch (error) {
      console.error('Error fetching KYC level:', error);
      return 1;
    }
  },

  /**
   * Met à jour le niveau KYC d'un client
   */
  updateKYCLevel: async (clientId: string, level: 1 | 2 | 3): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sfd_clients')
        .update({ kyc_level: level })
        .eq('id', clientId);

      if (error) {
        console.error('Error updating KYC level:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateKYCLevel:', error);
      return false;
    }
  },

  /**
   * Vérifie si un montant de prêt est autorisé pour le niveau KYC
   */
  validateLoanAmountForKYC: (kycLevel: number, loanAmount: number): boolean => {
    const limit = KYC_LIMITS[kycLevel];
    if (!limit) return false;
    return loanAmount <= limit.maxLoanAmount;
  },

  /**
   * Récupère les limites pour un niveau KYC
   */
  getKYCLimits: (level: number) => {
    return KYC_LIMITS[level] || KYC_LIMITS[1];
  },

  /**
   * Calcule le niveau KYC suggéré basé sur les documents fournis
   */
  calculateSuggestedKYCLevel: async (clientId: string): Promise<number> => {
    try {
      const { data: documents, error } = await supabase
        .from('client_documents')
        .select('document_type, verified')
        .eq('client_id', clientId)
        .eq('verified', true);

      if (error || !documents) {
        return 1;
      }

      const hasIdentity = documents.some(d => d.document_type === 'identity');
      const hasProofOfAddress = documents.some(d => d.document_type === 'proof_of_address');
      const hasBankStatement = documents.some(d => d.document_type === 'bank_statement');

      if (hasIdentity && hasProofOfAddress && hasBankStatement) {
        return 3;
      } else if (hasIdentity) {
        return 2;
      }

      return 1;
    } catch (error) {
      console.error('Error calculating suggested KYC level:', error);
      return 1;
    }
  }
};
