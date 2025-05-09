
import { useSfdAccounts } from './useSfdAccounts';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

/**
 * This is a compatibility adapter hook for the useSfdAccounts hook
 * It ensures backward compatibility with components that expected different
 * properties from the original implementation.
 */
export function useCompatSfdAccounts(sfdId?: string) {
  // Use the original hook
  const originalResult = useSfdAccounts(sfdId);
  
  // Return the result directly since the useSfdAccounts now includes all necessary properties
  return originalResult;
}

// Export this as a named export and as the default export
export default useCompatSfdAccounts;
