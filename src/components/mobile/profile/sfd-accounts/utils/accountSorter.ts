
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

/**
 * Sorts SFD accounts based on priority:
 * 1. Priority SFDs ("premier sfd", "deuxieme", "troisieme") first
 * 2. Active/default accounts next
 * 3. Verified accounts next
 * 4. Then alphabetically by name
 */
export function sortAccounts(accounts: SfdAccountDisplay[]): SfdAccountDisplay[] {
  const prioritySfdNames = ["premier sfd", "deuxieme", "troisieme"];
  
  return [...accounts].sort((a, b) => {
    // Priority SFDs come first
    const aIsPriority = prioritySfdNames.includes(a.name.toLowerCase());
    const bIsPriority = prioritySfdNames.includes(b.name.toLowerCase());
    
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    
    // If both are priority SFDs, sort by their order in the prioritySfdNames array
    if (aIsPriority && bIsPriority) {
      return prioritySfdNames.indexOf(a.name.toLowerCase()) - prioritySfdNames.indexOf(b.name.toLowerCase());
    }
    
    // Default accounts come next
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    
    // Then verified accounts
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    
    // Sort by name (alphabetically)
    return a.name.localeCompare(b.name);
  });
}
