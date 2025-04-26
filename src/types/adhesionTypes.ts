
export interface AdhesionRequestInput {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
}

// Add the ClientAdhesionRequest interface that's still being used
export interface ClientAdhesionRequest {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  sfd_id: string;
  sfd_name?: string;
  reference_number?: string;
  notes?: string;
  processed_at?: string;
  processed_by?: string;
}
