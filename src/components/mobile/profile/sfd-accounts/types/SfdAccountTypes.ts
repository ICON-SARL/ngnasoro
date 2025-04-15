
export interface SfdAccountDisplay {
  id: string;
  name: string;
  balance: number;
  currency: string;
  code: string;
  region: string;
  logoUrl: string | null;
  isDefault: boolean;
  isVerified: boolean;
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
}
