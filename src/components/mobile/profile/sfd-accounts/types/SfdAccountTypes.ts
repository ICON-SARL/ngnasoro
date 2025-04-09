
export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string | null;
}

export interface SfdRequest {
  id: string;
  user_id: string;
  sfd_id: string;
  status: string;
  created_at: string;
}
