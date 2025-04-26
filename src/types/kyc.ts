
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface KycVerificationDocument {
  id: string;
  user_id?: string;
  document_type: string;
  document_url: string;
  verification_status: VerificationStatus;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  client_code?: string;
  adhesion_request_id?: string;
}
