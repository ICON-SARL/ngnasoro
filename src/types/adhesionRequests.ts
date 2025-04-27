
export interface AdhesionRequest {
  id?: string;
  sfd_id: string;
  status: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  reference_number?: string;
}

export interface ClientAdhesionRequest extends AdhesionRequest {
  address?: string;
  id_number?: string;
  id_type?: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  rejection_reason?: string;
  verification_stage?: string;
  kyc_status?: string;
  profession?: string;
  monthly_income?: number;
  source_of_income?: string;
}

export interface AdhesionRequestInput {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
  id_number?: string;
  id_type?: string;
}
