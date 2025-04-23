
import { supabase } from '@/integrations/supabase/client';

// Type pour les stats du dashboard MEREF
export interface MerefDashboardStats {
  activeSfds: number;
  activeUsers: number;
  pendingRequests: number;
  totalTransactions: number;
}

export const apiClient = {
  // Récupère les statistiques du dashboard MEREF
  async getMerefDashboardStats(userId: string): Promise<MerefDashboardStats> {
    try {
      // Vérifier s'il y a des SFDs actives
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name')
        .eq('status', 'active');
        
      if (sfdsError) throw sfdsError;
      
      // Vérifier les demandes en attente
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select('id')
        .eq('status', 'pending');
        
      if (requestsError) throw requestsError;
      
      // Vérifier le nombre d'utilisateurs
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
        
      if (userError) throw userError;
      
      return {
        activeSfds: sfds?.length || 0,
        activeUsers: userCount || 0,
        pendingRequests: requests?.length || 0,
        totalTransactions: 0 // À implémenter plus tard si nécessaire
      };
    } catch (error) {
      console.error('Error fetching MEREF dashboard stats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        activeSfds: 0,
        activeUsers: 0,
        pendingRequests: 0,
        totalTransactions: 0
      };
    }
  }
};
