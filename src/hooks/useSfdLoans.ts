import { useUserRole } from './useUserRole';
import { useSfdAdminLoans } from './useSfdAdminLoans';
import { useClientLoans } from './useClientLoans';
import { LoanHookReturn } from '@/types/loanHook';

/**
 * Unified hook that detects user role and returns the appropriate loan hook
 * - SFD Admins: see all loans in their SFD
 * - Clients: see only their own loans
 */
export function useSfdLoans(): LoanHookReturn {
  const { isSfdAdmin } = useUserRole();
  
  // SFD admins see all loans in their SFD
  if (isSfdAdmin()) {
    const result = useSfdAdminLoans();
    return result;
  }
  
  // Clients see only their own loans
  const result = useClientLoans();
  return result;
}
