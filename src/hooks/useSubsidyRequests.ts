
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubsidyRequest {
  id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  justification?: string;
  expected_impact?: string;
  region?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  requested_by: string;
  supporting_documents?: string[];
  alert_triggered: boolean;
  sfds?: {
    name: string;
    code: string;
    region: string;
    id: string;
  };
}

export interface SubsidyThreshold {
  id: string;
  threshold_name: string;
  threshold_amount: number;
  notification_emails?: string[];
  is_active: boolean;
  created_at: string;
}

interface UseSubsidyRequestsOptions {
  status?: 'pending' | 'approved' | 'rejected';
  sfdId?: string;
}

export function useSubsidyRequests(options: UseSubsidyRequestsOptions = {}) {
  const { activeSfdId } = useAuth();
  const sfdId = options.sfdId || activeSfdId;
  
  // Fetch subsidy requests
  const { data: subsidyRequests, isLoading, error, refetch } = useQuery({
    queryKey: ['subsidy-requests', sfdId, options.status],
    queryFn: async () => {
      let query = supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds:sfd_id(id, name, region, code)
        `)
        .order('created_at', { ascending: false });
        
      // Apply filters if provided
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SubsidyRequest[];
    },
    enabled: !!sfdId
  });

  // Fetch subsidy thresholds
  const { data: alertThresholds, isLoading: isLoadingThresholds } = useQuery({
    queryKey: ['subsidy-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .select('*')
        .order('threshold_amount', { ascending: false });

      if (error) throw error;
      return data as SubsidyThreshold[];
    }
  });

  return {
    subsidyRequests: subsidyRequests || [],
    isLoading,
    error,
    refetch,
    alertThresholds: alertThresholds || [],
    isLoadingThresholds
  };
}
