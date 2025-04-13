
export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
}

export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  status: string;
  created_at: string;
}
