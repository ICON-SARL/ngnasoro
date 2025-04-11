
export interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: 'active' | 'suspended' | 'pending';
  logo_url?: string;
  contact_email?: string;
  phone?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
}

export interface SfdStats {
  total_clients: number;
  total_loans: number;
  repayment_rate: number;
  last_updated: string;
}
