export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  name?: string;
  amount: number;
  used_amount: number;
  status: string;
  description?: string;
  sponsor_id?: string;
  approved_by?: string;
  approved_at?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface SubsidyUsage {
  id: string;
  subsidy_id: string;
  loan_id: string;
  amount: number;
  used_at: string;
  notes?: string;
}

export interface SubsidyRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  requested_by: string;
  requester_name?: string;
  amount: number;
  purpose?: string;
  justification: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  region?: string;
  expected_impact?: string;
  alert_triggered: boolean;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_name?: string;
  decision_comments?: string;
}

export interface SubsidyActivity {
  id: string;
  request_id?: string;
  subsidy_id?: string;
  activity_type: string;
  performed_by: string;
  performer_name?: string;
  performed_at?: string;
  created_at: string;
  details?: any;
  description?: string;
}

export interface SubsidyAlertThreshold {
  id: string;
  sfd_id: string;
  low_threshold: number;
  critical_threshold: number;
  created_at: string;
  updated_at: string;
}
