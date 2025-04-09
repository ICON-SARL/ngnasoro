
export interface SfdAccount {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  is_default?: boolean;
}

export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  status: string;
}

export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SfdAccountItem {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string;
  };
}
