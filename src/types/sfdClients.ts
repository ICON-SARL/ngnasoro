
export interface SfdClient {
  id: string;
  user_id?: string;
  sfd_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'validated' | 'rejected';
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
  kyc_level: number;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: 'id_card' | 'passport' | 'proof_of_address' | 'selfie' | 'other';
  document_url: string;
  verified: boolean;
  uploaded_at: string;
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
