
export interface ClientAdhesionRequest {
  id: string;
  user_id?: string;
  sfd_id: string;
  sfd_name?: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'approved' | 'rejected';
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
