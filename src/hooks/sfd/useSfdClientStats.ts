
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  newClientsThisMonth: number;
}

export function useSfdClientStats(sfdId: string | null) {
  const fetchClientStats = async (): Promise<ClientStats> => {
    if (!sfdId) return {
      totalClients: 0,
      activeClients: 0,
      pendingClients: 0,
      newClientsThisMonth: 0
    };

    try {
      // Get total client count
      const { count: totalCount, error: totalError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfdId);
      
      if (totalError) throw totalError;

      // Get active clients count
      const { count: activeCount, error: activeError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfdId)
        .eq('status', 'validated');
      
      if (activeError) throw activeError;

      // Get pending clients count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfdId)
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;

      // Get new clients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newClientsCount, error: newClientsError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfdId)
        .gte('created_at', startOfMonth.toISOString());
      
      if (newClientsError) throw newClientsError;

      return {
        totalClients: totalCount || 0,
        activeClients: activeCount || 0,
        pendingClients: pendingCount || 0,
        newClientsThisMonth: newClientsCount || 0
      };
    } catch (error) {
      console.error('Error fetching client stats:', error);
      return {
        totalClients: 0,
        activeClients: 0,
        pendingClients: 0,
        newClientsThisMonth: 0
      };
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['sfd-client-stats', sfdId],
    queryFn: fetchClientStats,
    enabled: !!sfdId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    clientStats: data || {
      totalClients: 0,
      activeClients: 0,
      pendingClients: 0,
      newClientsThisMonth: 0
    },
    isLoading,
    error
  };
}
