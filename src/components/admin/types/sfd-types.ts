
export interface Sfd {
  id: string;
  name: string;
  code: string;
  email?: string;
  contact_email?: string; // Add missing field
  phone?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  legal_document_url?: string; // Add missing field
  region?: string;
  status?: 'pending' | 'active' | 'suspended';
  created_at?: string;
  updated_at?: string;
  suspended_at?: string;
  suspension_reason?: string;
  subsidy_balance?: number; // Add missing field
  
  // Stats and relations
  client_count?: number;
  loan_count?: number;
  total_loan_amount?: number;
  admin_count?: number;
  last_admin_login?: string;
}

// Add SfdAuditLog type
export interface SfdAuditLog {
  id: string;
  user_id: string;
  action: string;
  category: string;
  severity: string;
  status: 'success' | 'failure';
  details?: Record<string, any>;
  error_message?: string;
  created_at: string;
  target_resource?: string;
  ip_address?: string;
  device_info?: string;
}
