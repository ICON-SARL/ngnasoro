
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SubsidyRequest = {
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
};

export type SubsidyThreshold = {
  id: string;
  threshold_name: string;
  threshold_amount: number;
  notification_emails?: string[];
  is_active: boolean;
  created_at: string;
};

export function useSubsidyRequests() {
  // Fetch subsidy requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['subsidy-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds:sfd_id(name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match SubsidyRequest type
      return (data || []).map(item => ({
        ...item,
        purpose: item.justification || '',
        priority: 'normal' as const,
        requested_by: item.sfd_id,
        alert_triggered: false
      })) as SubsidyRequest[];
    }
  });

  // Fetch subsidy thresholds
  const { data: thresholds, isLoading: isLoadingThresholds } = useQuery({
    queryKey: ['subsidy-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to match SubsidyThreshold type
      return (data || []).map(item => ({
        id: item.id,
        threshold_name: `Seuil ${item.low_threshold}`,
        threshold_amount: item.low_threshold,
        is_active: true,
        created_at: item.created_at
      })) as SubsidyThreshold[];
    }
  });

  return {
    requests: requests || [],
    isLoading,
    thresholds: thresholds || [],
    isLoadingThresholds
  };
}
