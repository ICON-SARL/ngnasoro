export interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  logo_url?: string | null;
  contact_email?: string;
  phone?: string;
  legal_document_url?: string | null;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface SfdSettings {
  loan_settings?: {
    max_loan_amount?: number;
    min_loan_amount?: number;
    default_interest_rate?: number;
    late_payment_fee?: number;
  };
  security_settings?: {
    password_expiry_days?: number;
    session_timeout_minutes?: number;
    ip_whitelist?: string[];
  };
  transaction_settings?: {
    daily_withdrawal_limit?: number;
    requires_2fa?: boolean;
    notification_enabled?: boolean;
  };
}

export interface ExtendedSfd extends Sfd {
  settings?: SfdSettings;
}
