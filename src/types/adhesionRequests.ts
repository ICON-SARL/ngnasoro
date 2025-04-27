
export interface ClientAdhesionRequest {
  id: string;
  user_id: string;
  sfd_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  reference_number: string;
  created_at: string;
  updated_at?: string;
  processed_by?: string;
  processed_at?: string;
  notes?: string;
  rejection_reason?: string;
  verification_stage?: string;
  kyc_status?: string;
}

export interface AdhesionRequest {
  id?: string;
  sfd_id: string;
  status: string;
  created_at?: string;
  full_name?: string;
  reference_number?: string;
}
