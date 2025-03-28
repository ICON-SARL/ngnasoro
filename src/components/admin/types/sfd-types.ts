
export type Sfd = {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  created_at: string;
  updated_at?: string;
  status?: 'active' | 'suspended' | 'pending';
  subsidy_balance?: number;
};

export type SfdSubsidy = {
  id: string;
  sfd_id: string;
  amount: number;
  allocated_at: string;
  allocated_by: string;
  status: 'pending' | 'active' | 'revoked' | 'depleted';
  used_amount: number;
  remaining_amount: number;
  description?: string;
  end_date?: string;
};

export type SfdAuditLog = {
  id: string;
  user_id?: string;
  action: string;
  category: string;
  severity: string;
  details?: Record<string, any>;
  target_resource?: string;
  status: 'success' | 'failure';
  error_message?: string;
  created_at: string;
};
