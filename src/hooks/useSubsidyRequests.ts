
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  
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

  // Add the missing methods
  const getSubsidyRequestById = async (requestId: string) => {
    const { data, error } = await supabase
      .from('subsidy_requests')
      .select(`
        *,
        sfds:sfd_id(name, code, region)
      `)
      .eq('id', requestId)
      .single();
    
    if (error) throw error;
    return data;
  };

  const getSubsidyRequestActivities = async (requestId: string) => {
    const { data, error } = await supabase
      .from('subsidy_request_activities')
      .select('*')
      .eq('request_id', requestId)
      .order('performed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  // Create subsidy request mutation
  const createSubsidyRequest = useMutation({
    mutationFn: async (request: Omit<SubsidyRequest, 'id' | 'created_at' | 'alert_triggered'>) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
    }
  });

  // Update subsidy request status mutation
  const updateSubsidyRequestStatus = useMutation({
    mutationFn: async ({ requestId, status, comments }: { requestId: string; status: string; comments: string }) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({
          status,
          decision_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create an activity record
      await supabase.from('subsidy_request_activities').insert({
        request_id: requestId,
        activity_type: `request_${status}`,
        performed_by: (await supabase.auth.getUser()).data.user?.id,
        description: `Request marked as ${status}`,
        details: { comments }
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
    }
  });

  // Update subsidy request priority mutation
  const updateSubsidyRequestPriority = useMutation({
    mutationFn: async ({ requestId, priority }: { requestId: string; priority: string }) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({ priority })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create an activity record
      await supabase.from('subsidy_request_activities').insert({
        request_id: requestId,
        activity_type: 'priority_updated',
        performed_by: (await supabase.auth.getUser()).data.user?.id,
        description: `Priority updated to ${priority}`
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
    }
  });

  // Alert threshold mutations
  const createAlertThreshold = useMutation({
    mutationFn: async (threshold: Omit<SubsidyThreshold, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .insert({
          ...threshold,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-thresholds'] });
    }
  });

  const updateAlertThreshold = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SubsidyThreshold> }) => {
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-thresholds'] });
    }
  });

  const deleteAlertThreshold = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subsidy_alert_thresholds')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-thresholds'] });
    }
  });

  return {
    subsidyRequests: subsidyRequests || [],
    isLoading,
    error,
    refetch,
    alertThresholds: alertThresholds || [],
    isLoadingThresholds,
    // Add the missing methods
    getSubsidyRequestById,
    getSubsidyRequestActivities,
    createSubsidyRequest,
    updateSubsidyRequestStatus,
    updateSubsidyRequestPriority,
    createAlertThreshold,
    updateAlertThreshold,
    deleteAlertThreshold
  };
}
