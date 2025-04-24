export interface AdhesionRequestInput {
  full_name: string;
  email: string; // Changed from optional to required to match useClientAdhesions type
  phone: string; // Changed from optional to required as well for consistency
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
}

export interface ClientAdhesionRequest {
  id: string;
  user_id?: string;
  sfd_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reference_number?: string;
  sfd_name?: string;
  monthly_income?: number;
  profession?: string;
  source_of_income?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface AdhesionFormData {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  profession?: string;
  monthly_income?: number;
  source_of_income?: string;
}
