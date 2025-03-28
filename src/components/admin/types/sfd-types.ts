
// SFD Types
export type SfdStatus = 'active' | 'suspended' | 'pending' | 'closed';

export interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  status: SfdStatus;
  created_at: string;
  updated_at: string;
  subsidy_balance?: number;
}

// SFD Client Types
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'pending' | 'validated' | 'suspended';
  kyc_level: number;
  created_at: string;
  sfd_id: string;
  user_id?: string;
}

// Credit Application Types
export type CreditApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface CreditApplication {
  id: string;
  reference: string;
  sfd_id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  created_at: string;
  status: CreditApplicationStatus;
  score: number;
  rejection_reason?: string;
  rejection_comments?: string;
  approval_comments?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
}

// SFD Subsidy Types
export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  allocated_at: string;
  allocated_by: string;
  status: 'active' | 'depleted' | 'expired' | 'cancelled';
  end_date?: string;
  description?: string;
}

// Audit Log Types
export type SfdAuditAction = 'creation' | 'modification' | 'suspension' | 'reactivation' | 'validation';

export interface SfdAuditLogEntry {
  id: string;
  sfd_id: string;
  sfd_name: string;
  action: SfdAuditAction;
  performed_by: string;
  performed_at: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

// Add the SfdAuditLog type that was missing
export interface SfdAuditLog {
  id: string;
  created_at: string;
  user_id?: string;
  action: string;
  category: string;
  severity: string;
  details?: any;
  status: 'success' | 'failure';
  error_message?: string;
  target_resource?: string;
}
