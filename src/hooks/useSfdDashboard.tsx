
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useDashboardStats, DashboardStats } from './useDashboardStats';
import { useSubsidyStatistics, SubsidyStatistics } from './useSubsidyStatistics';

interface SfdInfo {
  name: string;
  region: string;
  logo_url: string | null;
  code: string;
}

export function useSfdDashboard() {
  const { user, activeSfdId } = useAuth();
  const { stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const { statistics: subsidyStats, isLoading: isLoadingSubsidyStats, error: subsidyStatsError } = useSubsidyStatistics();
  
  const [sfdInfo, setSfdInfo] = useState<SfdInfo | null>(null);
  const [isLoadingSfdInfo, setIsLoadingSfdInfo] = useState(false);
  
  const isLoading = isLoadingStats || isLoadingSubsidyStats || isLoadingSfdInfo;
  const error = statsError || subsidyStatsError;
  
  // Fetch SFD info
  useEffect(() => {
    if (!activeSfdId) return;
    
    const fetchSfdInfo = async () => {
      setIsLoadingSfdInfo(true);
      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('name, region, logo_url, code')
          .eq('id', activeSfdId)
          .single();
          
        if (error) throw error;
        setSfdInfo(data);
      } catch (err) {
        console.error('Error fetching SFD info:', err);
      } finally {
        setIsLoadingSfdInfo(false);
      }
    };
    
    fetchSfdInfo();
  }, [activeSfdId]);
  
  return {
    stats,
    subsidyStats,
    sfdInfo,
    isLoading,
    error
  };
}
