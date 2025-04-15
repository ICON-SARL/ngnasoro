
/**
 * Utility functions to adapt and normalize SFD account data structures
 * across different parts of the application
 */

export function adaptSfdAccount(account: any) {
  if (!account) return null;
  
  // Create a normalized account object with all possible properties
  return {
    id: account.id,
    name: account.name || `Compte ${account.account_type || ''}`,
    sfd_id: account.sfd_id || account.id,
    account_type: account.account_type || '',
    description: account.description || null,
    balance: account.balance || 0,
    currency: account.currency || 'FCFA',
    status: account.status || 'active',
    code: account.code || '',
    region: account.region || '',
    logo_url: account.logo_url || account.logoUrl || null,
    logoUrl: account.logoUrl || account.logo_url || null,
    is_default: account.is_default || account.isDefault || false,
    isDefault: account.isDefault || account.is_default || false,
    isVerified: account.isVerified || true,
    created_at: account.created_at || '',
    updated_at: account.updated_at || '',
    // Include loan data if available
    loans: account.loans || []
  };
}

export function adaptSfdAccounts(accounts: any[]) {
  if (!accounts || !Array.isArray(accounts)) {
    return [];
  }
  
  return accounts.map(account => adaptSfdAccount(account));
}

export function formatCurrency(amount: number, currency: string = 'FCFA') {
  return `${amount.toLocaleString()} ${currency}`;
}

export function getAccountDisplayName(account: any) {
  if (!account) return '';
  
  if (account.description) {
    return account.description;
  }
  
  if (account.account_type) {
    return `Compte ${account.account_type}`;
  }
  
  return account.name || 'Compte SFD';
}
