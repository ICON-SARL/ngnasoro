
export interface SfdAccountDisplay {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
  code: string;
  region?: string;
  logoUrl?: string | null;
  logo_url?: string | null;
  isDefault?: boolean;
  is_default?: boolean;
  isVerified?: boolean;
  status?: string;
  sfd_id?: string;
  account_type?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  loans?: SfdLoan[];
}

export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string | null;
  description?: string;
}

export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

// Adapter function to normalize SFD account data format
export function normalizeSfdAccount(account: any): SfdAccountDisplay {
  return {
    id: account.id,
    name: account.name || `Compte ${account.account_type || 'SFD'}`,
    balance: account.balance || 0,
    currency: account.currency || 'FCFA',
    code: account.code || '',
    region: account.region || '',
    logoUrl: account.logoUrl || account.logo_url || null,
    logo_url: account.logo_url || account.logoUrl || null,
    isDefault: account.isDefault || account.is_default || false,
    is_default: account.is_default || account.isDefault || false,
    isVerified: account.isVerified || true,
    status: account.status || 'active',
    sfd_id: account.sfd_id || account.id,
    account_type: account.account_type || '',
    description: account.description || null,
    created_at: account.created_at || '',
    updated_at: account.updated_at || '',
    loans: account.loans || []
  };
}

// Adapter function to normalize multiple SFD accounts
export function normalizeSfdAccounts(accounts: any[]): SfdAccountDisplay[] {
  if (!accounts || !Array.isArray(accounts)) {
    return [];
  }
  return accounts.map(account => normalizeSfdAccount(account));
}
