
import { useState, useEffect } from 'react';
import { useAuth } from '../useAuth';
import { useRolePermissions } from '../useRolePermissions';
import { supabase } from '@/integrations/supabase/client';

interface SfdStats {
  totalClients: number;
  activeClients: number;
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  overdueLoans: number;
  lastUpdated: Date | null;
}

interface SfdAdminDashboardData {
  isLoading: boolean;
  error: Error | null;
  stats: SfdStats;
  refreshData: () => Promise<void>;
}

export function useSfdAdminDashboard(): SfdAdminDashboardData {
  const { user, activeSfdId } = useAuth();
  const { isSfdAdmin } = useRolePermissions();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<SfdStats>({
    totalClients: 0,
    activeClients: 0,
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    overdueLoans: 0,
    lastUpdated: null
  });

  const fetchDashboardData = async () => {
    if (!user || !activeSfdId || !isSfdAdmin) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les statistiques de la SFD depuis Supabase
      const { data: sfdStats, error: statsError } = await supabase
        .from('sfd_stats')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .single();

      if (statsError) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${statsError.message}`);
      }

      // Récupérer les données des prêts pour les stats détaillées
      const { data: loans, error: loansError } = await supabase
        .from('sfd_loans')
        .select('status')
        .eq('sfd_id', activeSfdId);

      if (loansError) {
        throw new Error(`Erreur lors de la récupération des prêts: ${loansError.message}`);
      }

      // Calculer les statistiques détaillées des prêts
      const activeLoans = loans ? loans.filter(loan => loan.status === 'active').length : 0;
      const pendingLoans = loans ? loans.filter(loan => loan.status === 'pending').length : 0;
      const overdueLoans = loans ? loans.filter(loan => loan.status === 'overdue').length : 0;

      // Mettre à jour les statistiques
      setStats({
        totalClients: sfdStats?.total_clients || 0,
        activeClients: sfdStats?.total_clients || 0, // À remplacer par la vraie valeur si disponible
        totalLoans: sfdStats?.total_loans || 0,
        activeLoans,
        pendingLoans,
        overdueLoans,
        lastUpdated: sfdStats?.last_updated ? new Date(sfdStats.last_updated) : null
      });
    } catch (err) {
      console.error('Erreur dans useSfdAdminDashboard:', err);
      setError(err instanceof Error ? err : new Error('Une erreur inconnue est survenue'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, activeSfdId, isSfdAdmin]);

  return {
    isLoading,
    error,
    stats,
    refreshData: fetchDashboardData
  };
}
