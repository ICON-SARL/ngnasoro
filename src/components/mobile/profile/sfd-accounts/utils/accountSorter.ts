
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

// Sort accounts in a consistent way:
// 1. Active or default accounts first
// 2. Then by name alphabetically
export function sortAccounts(accounts: SfdAccountDisplay[]): SfdAccountDisplay[] {
  return [...accounts].sort((a, b) => {
    // First criteria: active/default accounts first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Second criteria: default accounts
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    
    // Third criteria: sort by name alphabetically
    return a.name.localeCompare(b.name);
  });
}
