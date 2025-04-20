
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  kyc_level: 'none' | 'basic' | 'full';
  sfd_id: string;
  profession?: string | null;
  monthly_income?: number | null;
  reference_number?: string | null;
}
