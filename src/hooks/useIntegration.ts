
import { useState } from 'react';
import { integrationService, SfdSummary } from '@/utils/api/integrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch SFD summary
  const fetchSfdSummary = async (sfdId: string): Promise<SfdSummary | null> => {
    if (!user) {
      setError('User must be authenticated');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const summary = await integrationService.getSfdSummary(sfdId);
      return summary;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast({
        title: 'Error fetching SFD summary',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Approve or reject a subsidy request
  const handleSubsidyDecision = async (
    requestId: string,
    decision: 'approve' | 'reject',
    comments?: string
  ) => {
    if (!user) {
      setError('User must be authenticated');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await integrationService.triggerSubsidyApproval(
        requestId,
        decision === 'approve' ? 'approved' : 'rejected',
        user.id,
        comments
      );
      
      toast({
        title: 'Success',
        description: result.message,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast({
        title: 'Error processing subsidy decision',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper functions for encrypting/decrypting sensitive data
  const encryptData = (data: any) => {
    try {
      return integrationService.encryptSensitiveData(data);
    } catch (err) {
      console.error('Error encrypting data:', err);
      return null;
    }
  };
  
  const decryptData = (encryptedData: string) => {
    try {
      return integrationService.decryptSensitiveData(encryptedData);
    } catch (err) {
      console.error('Error decrypting data:', err);
      return null;
    }
  };
  
  return {
    isLoading,
    error,
    fetchSfdSummary,
    handleSubsidyDecision,
    encryptData,
    decryptData
  };
}
