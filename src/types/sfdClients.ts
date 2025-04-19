
export interface SfdClient {
  id: string;
  full_name: string;
  sfd_id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  status: string;
  kyc_level?: number;
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
}
