
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

/**
 * Sorts SFD accounts based on priority:
 * 1. Active/default accounts first
 * 2. Verified accounts next
 * 3. Then alphabetically by name
 */
export function sortAccounts(accounts: SfdAccountDisplay[]): SfdAccountDisplay[] {
  return [...accounts].sort((a, b) => {
    // Default accounts come first
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    
    // Then verified accounts
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    
    // Sort by name (alphabetically)
    return a.name.localeCompare(b.name);
  });
}
