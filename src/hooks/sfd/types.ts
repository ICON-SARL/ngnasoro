
export interface SfdData {
  id: string;
  name: string;
  region?: string;
  code: string;
  logo_url?: string;
  token?: string | null;
  lastFetched?: Date | null;
  status: 'active' | 'inactive' | string;
}

export interface SfdAccount {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logoUrl?: string;
  logo_url?: string;
  status?: string;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
  last_updated?: string;
  account_id?: string;
}
