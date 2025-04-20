
export interface ClientAdhesionRequest {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string | null;
  processed_by?: string | null;
  notes?: string | null;
  sfd_id: string;
  sfd_name?: string;
  user_id: string;
  id_type?: string | null;
  id_number?: string | null;
  monthly_income?: number | null;
  kyc_status?: string | null;
  verification_stage?: string | null;
  profession?: string | null;
  source_of_income?: string | null;
  reference_number?: string | null;
  rejection_reason?: string | null;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface AdhesionRequestInput {
  full_name: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
  phone?: string;
  email?: string;
  address?: string;
}
