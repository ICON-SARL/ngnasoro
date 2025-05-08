
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
      if (prop === 'isPending' && prop === 'mutate') {
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
      
      // Log warning for debugging
      console.warn(`Accessing missing property '${String(prop)}' on useSfdAccounts hook`);
      
      // Return null for undefined props to avoid errors
      return null;
    }
  });
}

// Export this as a named export and as the default export
export default useCompatSfdAccounts;
