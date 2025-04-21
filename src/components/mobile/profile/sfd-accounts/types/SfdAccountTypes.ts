
export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
}
