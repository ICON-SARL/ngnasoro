import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalSfds: number;
  activeSfds: number;
  pendingSfds: number;
  suspendedSfds: number;
  totalClients: number;
  totalLoans: number;
  totalSubsidies: number;
  pendingSubsidies: number;
}

interface MonthlyClientData {
  month: string;
  clients: number;
}

interface SfdPerformanceData {
  name: string;
  loans: number;
  clients: number;
}

interface LoanStatusData {
  name: string;
  value: number;
  color: string;
}

export interface MerefDashboardData {
  stats: DashboardStats;
  monthlyClients: MonthlyClientData[];
  sfdPerformance: SfdPerformanceData[];
  loanStatus: LoanStatusData[];
}

export const useMerefDashboardData = () => {
  return useQuery<MerefDashboardData>({
    queryKey: ['meref-dashboard'],
    queryFn: async () => {
      // Fetch SFD stats
      const { data: sfdsData, error: sfdsError } = await supabase
        .from('sfds')
        .select('status');

      if (sfdsError) throw sfdsError;

      const sfdStats = {
        totalSfds: sfdsData?.length || 0,
        activeSfds: sfdsData?.filter(s => s.status === 'active').length || 0,
        pendingSfds: sfdsData?.filter(s => s.status === 'pending').length || 0,
        suspendedSfds: sfdsData?.filter(s => s.status === 'suspended').length || 0
      };

      // Fetch client count
      const { count: clientCount, error: clientError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true });

      if (clientError) throw clientError;

      // Fetch loan stats
      const { data: loansData, error: loansError } = await supabase
        .from('sfd_loans')
        .select('status');

      if (loansError) throw loansError;

      // Fetch subsidy stats
      const { data: subsidiesData, error: subsidiesError } = await supabase
        .from('subsidy_requests')
        .select('status');

      if (subsidiesError) throw subsidiesError;

      // Get monthly client data for last 6 months
      const monthlyClients: MonthlyClientData[] = [];
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const { count } = await supabase
          .from('sfd_clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        monthlyClients.push({
          month: monthNames[month],
          clients: count || 0
        });
      }

      // Fetch top 5 SFDs by performance
      const { data: topSfds, error: topSfdsError } = await supabase
        .from('sfd_stats')
        .select(`
          *,
          sfds!sfd_id (name)
        `)
        .order('total_clients', { ascending: false })
        .limit(5);

      if (topSfdsError) throw topSfdsError;

      const sfdPerformance = topSfds?.map(s => ({
        name: (s.sfds as any)?.name || 'Inconnu',
        loans: s.total_loans || 0,
        clients: s.total_clients || 0
      })) || [];

      // Loan status distribution
      const loanStatus = [
        { 
          name: 'Actifs', 
          value: loansData?.filter(l => l.status === 'active').length || 0,
          color: '#10b981'
        },
        { 
          name: 'En attente', 
          value: loansData?.filter(l => l.status === 'pending').length || 0,
          color: '#f59e0b'
        },
        { 
          name: 'Approuvés', 
          value: loansData?.filter(l => l.status === 'approved').length || 0,
          color: '#3b82f6'
        },
        { 
          name: 'Complétés', 
          value: loansData?.filter(l => l.status === 'completed').length || 0,
          color: '#8b5cf6'
        },
        { 
          name: 'Défaillants', 
          value: loansData?.filter(l => l.status === 'defaulted').length || 0,
          color: '#ef4444'
        }
      ];

      return {
        stats: {
          ...sfdStats,
          totalClients: clientCount || 0,
          totalLoans: loansData?.length || 0,
          totalSubsidies: subsidiesData?.length || 0,
          pendingSubsidies: subsidiesData?.filter(s => s.status === 'pending').length || 0
        },
        monthlyClients,
        sfdPerformance,
        loanStatus
      };
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 60000 // Auto-refresh every minute
  });
};
