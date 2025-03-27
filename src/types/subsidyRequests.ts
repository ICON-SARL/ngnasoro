
export interface SubsidyRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string; // Joined field
  requested_by: string;
  requester_name?: string; // Joined field
  amount: number;
  purpose: string;
  justification?: string;
  supporting_documents?: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_name?: string; // Joined field
  decision_comments?: string;
  region?: string;
  expected_impact?: string;
  alert_triggered: boolean;
}

export interface SubsidyRequestActivity {
  id: string;
  request_id: string;
  activity_type: string;
  performed_by: string;
  performer_name?: string; // Joined field
  performed_at: string;
  details?: any;
  description?: string;
}

export interface SubsidyAlertThreshold {
  id: string;
  threshold_name: string;
  threshold_amount: number;
  notification_emails?: string[];
  created_by?: string;
  created_at: string;
  is_active: boolean;
}

export type SubsidyRequestFilter = {
  status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  minAmount?: number;
  maxAmount?: number;
  sfdId?: string;
  region?: string;
  alertTriggered?: boolean;
  startDate?: string;
  endDate?: string;
}
