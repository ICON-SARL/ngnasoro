
export interface ClientAdhesionRequest {
  id: string;
  sfd_id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_type: string | null;
  id_number: string | null;
  monthly_income: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  processed_by: string | null;
  rejection_reason: string | null;
  kyc_status: string | null;
  verification_stage: string | null;
  profession: string | null;
  source_of_income: string | null;
  reference_number: string | null;
  sfd_name?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}
