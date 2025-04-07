
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  sfd_id: string;
  user_id?: string;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  kyc_level: number;
  created_at: string;
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
  performed_at: string;
  performed_by?: string;
}
