
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
  // Add missing properties from the type errors
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
}
