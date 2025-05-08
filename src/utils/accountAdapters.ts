
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
    sfd_id: account.sfd_id || '' // Add sfd_id for components that need it
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
