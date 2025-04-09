
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { MobileMoneyWithdrawalHook } from './types';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const { user } = useAuth();

  const makeWithdrawal = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessingWithdrawal(true);
    
    try {
      // In a real implementation, this would call your Mobile Money API
      console.log(`Processing mobile money withdrawal to ${phoneNumber} (${provider}) for amount ${amount}`);
      
      // Log the withdrawal attempt for audit purposes
      await logAuditEvent(
        AuditLogCategory.FINANCIAL,
        'mobile_money_withdrawal',
        { 
          phoneNumber, 
          amount, 
          provider 
        },
        user.id,
        AuditLogSeverity.INFO,
        'success'
      );
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error) {
      console.error('Failed to process mobile money withdrawal:', error);
      
      // Log the failure
      await logAuditEvent(
        AuditLogCategory.FINANCIAL,
        'mobile_money_withdrawal_failed',
        { 
          phoneNumber, 
          amount, 
          provider,
          error: String(error)
        },
        user.id,
        AuditLogSeverity.ERROR,
        'failure'
      );
      
      return false;
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  return {
    isProcessingWithdrawal,
    makeWithdrawal
  };
}
