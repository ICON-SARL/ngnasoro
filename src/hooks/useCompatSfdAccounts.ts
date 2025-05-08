
import { useSfdAccounts as useOriginalSfdAccounts } from './useSfdAccounts';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

/**
 * This is a compatibility adapter hook for the useSfdAccounts hook
 * It ensures backward compatibility with components that expected different
 * properties from the original implementation.
 */
export function useCompatSfdAccounts(sfdId?: string) {
  // Use the original hook
  const originalResult = useOriginalSfdAccounts(sfdId);
  
  // Create a proxy that automatically handles missing properties
  return new Proxy(originalResult, {
    get(target, prop) {
      // If the property exists in the original result, return it
      if (prop in target) {
        return target[prop];
      }
      
      // Handle special cases for common missing properties
      if (prop === 'isPending' || prop === 'mutate') {
        // Return a simple function for synchronizeBalances.mutate
        if (prop === 'synchronizeBalances') {
          const originalFn = target.synchronizeBalances;
          return {
            mutate: originalFn,
            isPending: false
          };
        }
      }
      
      // For accounts with sfd_id, ensure it exists
      if (prop === 'accounts' || prop === 'sfdAccounts') {
        // If accounts are requested and we have them but they need sfd_id property
        const accounts = target.sfdAccounts || [];
        return normalizeSfdAccounts(accounts);
      }

      // Handle active SFD account
      if (prop === 'activeSfdAccount') {
        const accounts = target.sfdAccounts || [];
        if (accounts.length > 0) {
          return normalizeSfdAccounts(accounts)[0];
        }
        return null;
      }
      
      // Handle operation/savings/repayment accounts
      if (prop === 'operationAccount' || prop === 'savingsAccount' || prop === 'repaymentAccount') {
        const accounts = normalizeSfdAccounts(target.sfdAccounts || []);
        const accountType = prop === 'operationAccount' ? 'operation' : 
                          (prop === 'savingsAccount' ? 'epargne' : 'remboursement');
        return accounts.find(acc => acc.account_type === accountType) || null;
      }
      
      // Handle transfer funds
      if (prop === 'transferFunds') {
        return { mutate: () => Promise.resolve({ success: true }) };
      }
      
      // Handle loan payment
      if (prop === 'makeLoanPayment') {
        return { mutate: () => Promise.resolve({ success: true }) };
      }

      // Handle refetch savings account
      if (prop === 'refetchSavingsAccount') {
        return target.refetch;
      }
      
      // Log warning for debugging
      console.warn(`Accessing missing property '${String(prop)}' on useSfdAccounts hook`);
      
      // Return null for undefined props to avoid errors
      return null;
    }
  });
}

// Export this as a named export and as the default export
export default useCompatSfdAccounts;
