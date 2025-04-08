
export type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

export interface SubsidyFormData {
  sfd_id: string;
  amount: string;
  purpose: string;
  justification: string;
  priority: PriorityType;
  region: string;
  expected_impact: string;
}

export interface SubsidyRequestCreateProps {
  onSuccess?: () => void;
}

export interface SfdOption {
  id: string;
  name: string;
  region?: string;
}
