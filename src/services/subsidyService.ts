
import { supabase } from '@/integrations/supabase/client';

export const subsidyService = {
  async processSubsidyRequest(action: 'approve' | 'reject' | 'details', requestId: string, data?: any) {
    try {
      const { data: response, error } = await supabase.functions.invoke('process-subsidy-request', {
        body: JSON.stringify({
          action,
          requestId,
          data
        }),
      });
      
      if (error) throw error;
      return response;
    } catch (error) {
      console.error('Error processing subsidy request:', error);
      throw error;
    }
  },
  
  async approveSubsidyRequest(requestId: string) {
    return this.processSubsidyRequest('approve', requestId);
  },
  
  async rejectSubsidyRequest(requestId: string, comments?: string) {
    return this.processSubsidyRequest('reject', requestId, { comments });
  },
  
  async getSubsidyRequestDetails(requestId: string) {
    return this.processSubsidyRequest('details', requestId);
  }
};
