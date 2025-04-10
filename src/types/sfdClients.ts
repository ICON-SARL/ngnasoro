
export interface SfdClient {
  id: string;
  sfd_id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  kyc_level: number;
  created_at?: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: string;
  document_url: string;
  uploaded_at: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description?: string;
  performed_by?: string;
  performed_at: string;
}

export interface ClientSavingsAccount {
  id: string;
  client_id: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  last_transaction_date?: string;
}

export interface ClientBalanceOperation {
  clientId: string;
  amount: number;
  operationType: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  description?: string;
  adminId: string;
  reference?: string;
}
