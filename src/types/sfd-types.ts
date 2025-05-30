
export interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive' | string;
  logo_url?: string | null;
  contact_email?: string;
  phone?: string;
  legal_document_url?: string | null;
  description?: string;
  created_at: string; 
  updated_at?: string;
}
