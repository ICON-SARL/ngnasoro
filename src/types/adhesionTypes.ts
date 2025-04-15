export interface ClientAdhesionRequest {
  id: string;
  user_id?: string;
  sfd_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'pending_validation' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  reference_number?: string;
  kyc_status?: string;
  profession?: string;
  source_of_income?: string;
  monthly_income?: number;
  rejection_reason?: string;
}

export interface MobileMoneyWebhook {
  id: string;
  reference_id: string;
  provider: string;
  transaction_type: string;
  amount: number;
  phone_number: string;
  status: 'pending' | 'processed' | 'failed';
  user_id?: string;
  account_id?: string;
  created_at: string;
  processed_at?: string;
  raw_payload?: any;
  signature?: string;
  is_verified: boolean;
}

export interface MobileMoneySettings {
  id: string;
  provider: string;
  webhook_secret: string;
  api_key?: string;
  api_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
