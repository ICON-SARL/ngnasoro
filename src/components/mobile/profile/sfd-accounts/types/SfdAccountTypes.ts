
export interface SfdAccountDisplay {
  id: string;
  name: string;
  logoUrl?: string | null;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
  status?: string;
}

export interface AvailableSfd {
  id: string;
  name: string;
  code?: string;
  region?: string;
  logo_url?: string;
  status: string;
}

export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  status: string;
  created_at: string;
}
