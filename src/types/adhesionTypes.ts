
export interface ClientAdhesionRequest {
  id: string;
  sfd_id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_type: string | null;
  id_number: string | null;
  monthly_income: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  processed_by: string | null;
  rejection_reason: string | null;
  kyc_status: string | null;
  verification_stage: string | null;
  profession: string | null;
  source_of_income: string | null;
  reference_number: string | null;
  sfd_name?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

// Mobile Money Settings Interface
export interface MobileMoneySettings {
  id: string;
  provider: string;
  api_key: string | null;
  api_url: string | null;
  webhook_secret: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  provider_name: string;
  provider_logo_url?: string;
  transaction_fee_percentage?: number;
  transaction_fee_fixed?: number;
  minimum_amount?: number;
  maximum_amount?: number;
}

// Mobile Money Webhook Interface
export interface MobileMoneyWebhook {
  id: string;
  user_id: string;
  reference_id: string;
  amount: number;
  provider: string;
  phone_number: string;
  status: 'pending' | 'processed' | 'failed';
  transaction_type: 'deposit' | 'withdrawal';
  created_at: string;
  processed_at: string | null;
  account_id: string | null;
  raw_payload: any;
  metadata?: any;
}
