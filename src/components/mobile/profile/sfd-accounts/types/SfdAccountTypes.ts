
export interface AvailableSfd {
  id: string;
  name: string;
  code?: string;
  region?: string;
  logo_url?: string;
  status?: string;
  description?: string;
}

export interface SfdAccount {
  id: string;
  sfd_id: string;
  name: string;
  code?: string;
  region?: string;
  logo_url?: string | null;
  balance: number;
  currency: string;
  is_default?: boolean;
}

export interface SfdAccountDisplay {
  id: string;
  name: string;
  balance: number;
  currency: string;
  code?: string;
  region?: string;
  logoUrl?: string | null;
  isDefault?: boolean;
  isVerified?: boolean;
  status?: string;
}

export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  status: string;
  created_at: string;
}
