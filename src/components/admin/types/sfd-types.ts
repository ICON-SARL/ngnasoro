
export interface Sfd {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  region?: string;
  status?: 'pending' | 'active' | 'suspended';
  created_at?: string;
  updated_at?: string;
  suspended_at?: string;
  suspension_reason?: string;
  
  // Stats and relations
  client_count?: number;
  loan_count?: number;
  total_loan_amount?: number;
  admin_count?: number;
  last_admin_login?: string;
}
