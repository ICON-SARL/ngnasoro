
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SfdManagementStats {
  activeSfds: number;
  newSfdsThisMonth: number;
  adminCount: number;
  newAdminsThisMonth: number;
  pendingReports: number;
}

export const useSfdManagementStats = () => {
  const { toast } = useToast();

  const fetchSfdManagementStats = async (): Promise<SfdManagementStats> => {
    try {
      // Get first day of current month for date filtering
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Fetch active SFDs
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, created_at')
        .eq('status', 'active');
        
      if (sfdsError) throw sfdsError;
      
      // Count SFDs created this month
      const newSfdsThisMonth = sfds.filter(
        sfd => new Date(sfd.created_at) >= new Date(firstDayOfMonth)
      ).length;
      
      // Fetch SFD admin users
      const { data: admins, error: adminsError } = await supabase
        .from('user_roles')
        .select('id, created_at')
        .eq('role', 'sfd_admin');
        
      if (adminsError) throw adminsError;
      
      // Count admins created this month
      const newAdminsThisMonth = admins.filter(
        admin => new Date(admin.created_at) >= new Date(firstDayOfMonth)
      ).length;
      
      // For pending reports, we could query a reports table
      // For this example, we'll simulate pending reports
      const pendingReportsCount = 4; // This would be replaced with actual DB query
      
      return {
        activeSfds: sfds.length,
        newSfdsThisMonth,
        adminCount: admins.length,
        newAdminsThisMonth,
        pendingReports: pendingReportsCount
      };
    } catch (error: any) {
      console.error('Error fetching SFD management stats:', error);
      toast({
        title: "Erreur",
        description: `Impossible de récupérer les statistiques: ${error.message}`,
        variant: "destructive",
      });
      
      // Return fallback data
      return {
        activeSfds: 0,
        newSfdsThisMonth: 0,
        adminCount: 0,
        newAdminsThisMonth: 0,
        pendingReports: 0
      };
    }
  };

  return useQuery({
    queryKey: ['sfd-management-stats'],
    queryFn: fetchSfdManagementStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
