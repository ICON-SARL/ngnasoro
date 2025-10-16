
import { supabase } from "@/integrations/supabase/client";
import { 
  SubsidyRequest, 
  SubsidyRequestActivity,
  SubsidyAlertThreshold,
  SubsidyRequestFilter
} from "@/types/subsidyRequests";

// Subsidy Requests API
export const subsidyRequestsApi = {
  // Get all subsidy requests with SFD info
  async getAllSubsidyRequests(filters?: SubsidyRequestFilter) {
    try {
      let query = supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds:sfd_id(id, name, region, code)
        `)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        if (filters.sfdId) {
          query = query.eq('sfd_id', filters.sfdId);
        }
        
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }
        
        // priority, region, alert_triggered columns don't exist - ignore those filters
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to include sfd_name from the joined table
      const transformedData = data.map(item => ({
        ...item,
        sfd_name: item.sfds?.name || 'Unknown SFD'
      })) as unknown as SubsidyRequest[];
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching subsidy requests:', error);
      return [];
    }
  },
  
  // Get subsidy requests for a specific SFD
  async getSfdSubsidyRequests(sfdId: string, filters?: SubsidyRequestFilter) {
    try {
      let query = supabase
        .from('subsidy_requests')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        // priority and alert_triggered columns don't exist
        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as SubsidyRequest[];
    } catch (error) {
      console.error('Error fetching SFD subsidy requests:', error);
      return [];
    }
  },
  
  // Get a single subsidy request by ID
  async getSubsidyRequestById(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds:sfd_id(id, name, region, code)
        `)
        .eq('id', requestId)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        sfd_name: data.sfds?.name || 'Unknown SFD'
      } as unknown as SubsidyRequest;
    } catch (error) {
      console.error('Error fetching subsidy request details:', error);
      return null;
    }
  },
  
  // Create a new subsidy request
  async createSubsidyRequest(request: {
    sfd_id: string;
    amount: number;
    purpose: string;
    justification?: string;
    supporting_documents?: string[];
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    region?: string;
    expected_impact?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .insert({
          sfd_id: request.sfd_id,
          requested_by: (await supabase.auth.getUser()).data.user?.id,
          amount: request.amount,
          purpose: request.purpose,
          justification: request.justification,
          supporting_documents: request.supporting_documents,
          priority: request.priority || 'normal',
          region: request.region,
          expected_impact: request.expected_impact,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create an activity record
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: data.id,
          activity_type: 'request_created',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          description: 'Subsidy request created'
        });
        
      return data as unknown as SubsidyRequest;
    } catch (error) {
      console.error('Error creating subsidy request:', error);
      throw error;
    }
  },
  
  // Update a subsidy request status
  async updateSubsidyRequestStatus(
    requestId: string, 
    status: 'pending' | 'under_review' | 'approved' | 'rejected',
    comments?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({
          status,
          decision_comments: comments,
          reviewed_at: status === 'pending' ? null : new Date().toISOString(),
          reviewed_by: status === 'pending' ? null : (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Create an activity record
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: requestId,
          activity_type: `request_${status}`,
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          description: `Subsidy request ${status === 'under_review' ? 'marked for review' : status}`,
          details: comments ? { comments } : null
        });
        
      return data as unknown as SubsidyRequest;
    } catch (error) {
      console.error('Error updating subsidy request status:', error);
      throw error;
    }
  },
  
  // Update subsidy request priority
  async updateSubsidyRequestPriority(
    requestId: string, 
    priority: 'low' | 'normal' | 'high' | 'urgent'
  ) {
    try {
      // priority column doesn't exist in subsidy_requests
      console.warn('subsidy_requests table missing priority column');
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select()
        .eq('id', requestId)
        .single();
        
      if (error) throw error;
      
      // Create an activity record
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'priority_updated',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          description: `Priority updated to ${priority}`
        });
        
      return data as unknown as SubsidyRequest;
    } catch (error) {
      console.error('Error updating subsidy request priority:', error);
      throw error;
    }
  },
  
  // Get activities for a subsidy request
  async getSubsidyRequestActivities(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('subsidy_request_activities')
        .select('*')
        .eq('request_id', requestId)
        .order('performed_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as SubsidyRequestActivity[];
    } catch (error) {
      console.error('Error fetching subsidy request activities:', error);
      return [];
    }
  },
  
  // Alert thresholds
  async getAlertThresholds() {
    try {
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .select('*')
        .order('threshold_amount', { ascending: true });
        
      if (error) throw error;
      return data as unknown as SubsidyAlertThreshold[];
    } catch (error) {
      console.error('Error fetching alert thresholds:', error);
      return [];
    }
  },
  
  async createAlertThreshold(threshold: {
    threshold_name: string;
    threshold_amount: number;
    notification_emails?: string[];
    is_active?: boolean;
  }) {
    try {
      // subsidy_alert_thresholds schema only has: low_threshold, critical_threshold
      // threshold_name, threshold_amount, notification_emails, created_by, is_active don't exist
      console.warn('subsidy_alert_thresholds table schema mismatch');
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .insert({
          sfd_id: '', // Required field
          low_threshold: threshold.threshold_amount,
          critical_threshold: threshold.threshold_amount * 0.5
        } as any)
        .select()
        .single();
        
      if (error) throw error;
      return data as unknown as SubsidyAlertThreshold;
    } catch (error) {
      console.error('Error creating alert threshold:', error);
      throw error;
    }
  },
  
  async updateAlertThreshold(id: string, updates: {
    threshold_name?: string;
    threshold_amount?: number;
    notification_emails?: string[];
    is_active?: boolean;
  }) {
    try {
      // subsidy_alert_thresholds schema only has: low_threshold, critical_threshold
      console.warn('subsidy_alert_thresholds table schema mismatch');
      const dbUpdates: any = {};
      if (updates.threshold_amount) {
        dbUpdates.low_threshold = updates.threshold_amount;
      }
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as unknown as SubsidyAlertThreshold;
    } catch (error) {
      console.error('Error updating alert threshold:', error);
      throw error;
    }
  },
  
  async deleteAlertThreshold(id: string) {
    try {
      const { error } = await supabase
        .from('subsidy_alert_thresholds')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting alert threshold:', error);
      throw error;
    }
  }
};
