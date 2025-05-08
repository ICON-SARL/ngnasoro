
import { SfdAccount, SfdClientAccount } from "@/hooks/sfd/types";

/**
 * Helper to adapt account data to ensure compatibility with components
 * that expect different property names or structures
 */
export function adaptSfdAccount(account: any): SfdAccount {
  if (!account) return null;
  
  return {
    id: account.id,
    name: account.name || account.description || `Compte ${account.account_type || ''}`,
    code: account.code || '',
    description: account.description || '',
    logo_url: account.logo_url || account.logoUrl || null,
    logoUrl: account.logo_url || account.logoUrl || null, // Add both versions for compatibility
    balance: account.balance || 0,
    currency: account.currency || 'FCFA',
    status: account.status || 'active',
    sfds: account.sfds || {
      id: account.sfd_id || account.id,
      name: account.name || '',
      logo_url: account.logo_url || account.logoUrl || null
    },
    is_default: account.is_default || account.isDefault || false,
    sfd_id: account.sfd_id || '', // Add sfd_id for components that need it
    account_type: account.account_type || '',
    loans: account.loans || [],
    created_at: account.created_at || new Date().toISOString(),
    updated_at: account.updated_at || new Date().toISOString()
  };
}

/**
 * Convert an array of various account formats to a consistent SfdAccount format
 */
export function normalizeSfdAccounts(accounts: any[]): SfdAccount[] {
  if (!accounts || !Array.isArray(accounts)) return [];
  return accounts.map(adaptSfdAccount).filter(Boolean);
}

/**
 * Helper to find the operation/main account from a list of accounts
 */
export function findOperationAccount(accounts: any[]): any {
  if (!accounts || !Array.isArray(accounts)) return null;
  
  // First try to find by account_type
  const opAccount = accounts.find(acc => acc.account_type === 'operation');
  if (opAccount) return opAccount;
  
  // If not found, try the default account
  const defaultAccount = accounts.find(acc => acc.is_default || acc.isDefault);
  if (defaultAccount) return defaultAccount;
  
  // If still not found, return the first account or null
  return accounts[0] || null;
}

/**
 * Convert SfdAccount to SfdAccountDisplay format for display components
 */
export function adaptToSfdAccountDisplay(account: SfdAccount): any {
  return {
    id: account.id,
    name: account.name || account.description || '',
    balance: account.balance || 0,
    logo_url: account.logo_url || account.logoUrl || null,
    currency: account.currency || 'FCFA',
    code: account.code || '',
    region: account.region || '',
    description: account.description || '',
    status: account.status || 'active',
    isVerified: true,
    isActive: false,
    is_default: account.is_default || false
  };
}

/**
 * Sort accounts, placing the active one first
 */
export function sortAccounts(accounts: any[], activeSfdId?: string | null): any[] {
  if (!accounts || !accounts.length) return [];
  
  return [...accounts].sort((a, b) => {
    // Active account first
    if (a.id === activeSfdId) return -1;
    if (b.id === activeSfdId) return 1;
    
    // Then default accounts
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    
    // Then by name
    return (a.name || '').localeCompare(b.name || '');
  });
}
