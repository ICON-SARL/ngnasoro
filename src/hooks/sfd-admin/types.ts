
export interface SfdAdmin {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  sfd_id?: string;
  sfd_name?: string;
  is_active?: boolean;
  has_2fa?: boolean;
  created_at?: string;
  last_sign_in_at?: string | null;
}
