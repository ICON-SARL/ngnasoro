
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

export const sortAccounts = (accounts: SfdAccountDisplay[]): SfdAccountDisplay[] => {
  if (!accounts || !Array.isArray(accounts)) return [];
  
  // Sort accounts: first default ones, then by name
  return [...accounts].sort((a, b) => {
    // Default accounts first
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
};

// Add this helper function for checking if balance can be displayed
export const canDisplayBalance = (account: SfdAccountDisplay | null): boolean => {
  if (!account) return false;
  return account.isVerified || account.isDefault;
};
