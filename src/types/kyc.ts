
export interface KycVerificationDocument {
  id: string;
  document_type: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at?: string;
  verification_notes?: string;
  user_id?: string;
  adhesion_request_id?: string;
  client_code?: string;
}
