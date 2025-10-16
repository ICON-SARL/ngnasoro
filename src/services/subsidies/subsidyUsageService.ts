import { supabase } from '@/integrations/supabase/client';
import { SubsidyUsage } from '@/types/subsidies';

/**
 * Service pour tracer l'utilisation des subventions
 */

export const subsidyUsageService = {
  /**
   * Enregistre l'utilisation d'une subvention pour un prêt
   */
  recordUsage: async (
    subsidyId: string,
    loanId: string,
    amount: number,
    notes?: string
  ): Promise<SubsidyUsage | null> => {
    try {
      const { data, error } = await supabase
        .from('subsidy_usage')
        .insert({
          subsidy_id: subsidyId,
          loan_id: loanId,
          amount,
          notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording subsidy usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in recordUsage:', error);
      return null;
    }
  },

  /**
   * Récupère l'historique d'utilisation d'une subvention
   */
  getUsageHistory: async (subsidyId: string): Promise<SubsidyUsage[]> => {
    try {
      const { data, error } = await supabase
        .from('subsidy_usage')
        .select('*')
        .eq('subsidy_id', subsidyId)
        .order('used_at', { ascending: false });

      if (error) {
        console.error('Error fetching subsidy usage history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUsageHistory:', error);
      return [];
    }
  },

  /**
   * Récupère les subventions utilisées pour un prêt
   */
  getUsageForLoan: async (loanId: string): Promise<SubsidyUsage[]> => {
    try {
      const { data, error } = await supabase
        .from('subsidy_usage')
        .select('*')
        .eq('loan_id', loanId);

      if (error) {
        console.error('Error fetching loan subsidy usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUsageForLoan:', error);
      return [];
    }
  },

  /**
   * Calcule le montant total utilisé d'une subvention
   */
  getTotalUsed: async (subsidyId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('subsidy_usage')
        .select('amount')
        .eq('subsidy_id', subsidyId);

      if (error || !data) {
        return 0;
      }

      return data.reduce((sum, item) => sum + (item.amount || 0), 0);
    } catch (error) {
      console.error('Error in getTotalUsed:', error);
      return 0;
    }
  },

  /**
   * Vérifie si une subvention a assez de fonds disponibles
   */
  hasAvailableFunds: async (subsidyId: string, requiredAmount: number): Promise<boolean> => {
    try {
      const { data: subsidy, error } = await supabase
        .from('sfd_subsidies')
        .select('amount, used_amount')
        .eq('id', subsidyId)
        .single();

      if (error || !subsidy) {
        return false;
      }

      const available = subsidy.amount - (subsidy.used_amount || 0);
      return available >= requiredAmount;
    } catch (error) {
      console.error('Error in hasAvailableFunds:', error);
      return false;
    }
  },

  /**
   * Obtient le montant disponible d'une subvention
   */
  getAvailableAmount: async (subsidyId: string): Promise<number> => {
    try {
      const { data: subsidy, error } = await supabase
        .from('sfd_subsidies')
        .select('amount, used_amount')
        .eq('id', subsidyId)
        .single();

      if (error || !subsidy) {
        return 0;
      }

      return subsidy.amount - (subsidy.used_amount || 0);
    } catch (error) {
      console.error('Error in getAvailableAmount:', error);
      return 0;
    }
  }
};
