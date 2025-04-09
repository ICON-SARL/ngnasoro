
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubsidyRequest {
  id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  status: string;
  created_at: string;
  requested_by: string;
}

interface UseSfdSubsidyRequestsProps {
  status?: string;
  sfdId?: string | null;
  limit?: number;
}

export function useSfdSubsidyRequests({ 
  status = 'all', 
  sfdId = null,
  limit = 10
}: UseSfdSubsidyRequestsProps = {}) {
  const fetchSubsidyRequests = async (): Promise<SubsidyRequest[]> => {
    if (!sfdId) return [];

    try {
      let query = supabase
        .from('subsidy_requests')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching subsidy requests:', error);
      return [];
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['sfd-subsidy-requests', sfdId, status, limit],
    queryFn: fetchSubsidyRequests,
    enabled: !!sfdId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    subsidyRequests: data || [],
    isLoading,
    error
  };
}
