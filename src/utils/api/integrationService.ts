
import { supabase } from '@/integrations/supabase/client';
import { EncryptionService } from '@/utils/crypto';

// Encryption key for sensitive data (should be stored securely)
const ENCRYPTION_KEY = 'secure-encryption-key-for-sensitive-data';

// Types for integration responses
export interface SfdSummary {
  id: string;
  name: string;
  code: string;
  region: string;
  status: string;
  client_count: number;
  active_loans_count: number;
  total_active_loan_amount: number;
  pending_loans_count: number;
  total_subsidies: number;
  remaining_subsidies: number;
  active_subsidies_count: number;
}

export interface SubsidyApprovalResult {
  success: boolean;
  message: string;
  subsidy?: any;
}

// Integration service for connecting different components
export const integrationService = {
  // Get SFD summary statistics
  async getSfdSummary(sfdId: string): Promise<SfdSummary> {
    try {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: JSON.stringify({ path: `/api/sfds/${sfdId}/summary` }),
      });
      
      if (error) throw error;
      return data.data as SfdSummary;
    } catch (error) {
      console.error('Error fetching SFD summary:', error);
      throw error;
    }
  },
  
  // Trigger subsidy approval webhook - now uses the api-gateway endpoint instead of subsidy-webhooks
  async triggerSubsidyApproval(
    requestId: string, 
    status: 'approved' | 'rejected', 
    reviewedBy: string,
    comments?: string
  ): Promise<SubsidyApprovalResult> {
    try {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: JSON.stringify({ 
          path: '/subsidy-webhooks',
          requestId,
          status,
          reviewedBy,
          comments
        }),
      });
      
      if (error) throw error;
      return data as SubsidyApprovalResult;
    } catch (error) {
      console.error('Error triggering subsidy approval:', error);
      throw error;
    }
  },
  
  // Encrypt sensitive data before storing in database
  encryptSensitiveData(data: any): string {
    return EncryptionService.encrypt(data, ENCRYPTION_KEY);
  },
  
  // Decrypt sensitive data after retrieving from database
  decryptSensitiveData(encryptedData: string): any {
    try {
      const decrypted = EncryptionService.decrypt(encryptedData, ENCRYPTION_KEY);
      return EncryptionService.parseDecrypted(decrypted);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }
};
