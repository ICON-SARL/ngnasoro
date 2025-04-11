
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
  
  // Additional properties used in the components
  email?: string;
  address?: string;
  legal_document_url?: string;
  subsidy_balance?: number;
  
  // Extended properties for SFD details view
  suspended_at?: string;
  suspension_reason?: string;
  client_count?: number;
  loan_count?: number;
  total_loan_amount?: number;
  admin_count?: number;
  last_admin_login?: string;
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

// Add the missing SfdAuditLog interface
export interface SfdAuditLog {
  id: string;
  user_id?: string;
  action: string;
  category: string;
  severity: string;
  status: string;
  details?: Record<string, any>;
  created_at: string;
  error_message?: string;
}
