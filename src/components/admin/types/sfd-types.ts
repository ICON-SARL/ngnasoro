
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
}
