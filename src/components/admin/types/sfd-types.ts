
export interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: 'active' | 'suspended';
  subsidy_balance?: number;
  active_loans_count?: number;
  repayment_rate_pct?: number;
  logo_url?: string;
  legal_document_url?: string;
  created_at: string;
  updated_at?: string;
  email?: string;
  phone?: string;
  contact_email?: string;
}

export interface SfdAuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  performed_by: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
  
  // Add the missing properties needed by AuditLogTable
  created_at: string;
  user_id?: string;
  category: string;
  severity: string;
  status: string;
  details?: Record<string, any>;
  error_message?: string;
}
