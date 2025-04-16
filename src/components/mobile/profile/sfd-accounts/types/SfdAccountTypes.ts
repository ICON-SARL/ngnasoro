
export interface AvailableSfd {
  id: string;
  name: string;
  code?: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
}

export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  status: string;
  created_at: string;
  sfd_name?: string;
}

export interface SfdAccountDisplay {
  id: string;
  name: string;
  code?: string;
  region?: string;
  status: string;
  balance?: number;
  currency?: string;
  logo_url?: string;
  is_default?: boolean;
  isVerified?: boolean;
  last_updated?: string;
}
