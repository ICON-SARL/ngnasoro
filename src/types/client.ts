export interface SfdClient {
  id: string;
  sfd_id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  client_code?: string;
  kyc_level: 1 | 2 | 3;
  created_at: string;
  updated_at: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: 'identity' | 'proof_of_address' | 'bank_statement' | 'other';
  document_url: string;
  uploaded_at: string;
  uploaded_by: string;
  status: 'pending' | 'verified' | 'rejected';
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description: string;
  performed_by: string;
  performed_at: string;
  created_at: string;
}

export interface KYCLimit {
  level: 1 | 2 | 3;
  maxLoanAmount: number;
  requiredDocuments: string[];
  description: string;
}

export const KYC_LIMITS: Record<number, KYCLimit> = {
  1: {
    level: 1,
    maxLoanAmount: 50000,
    requiredDocuments: ['Informations basiques'],
    description: 'Niveau basique - Limite 50K FCFA'
  },
  2: {
    level: 2,
    maxLoanAmount: 500000,
    requiredDocuments: ['Informations basiques', 'Pièce d\'identité'],
    description: 'Niveau intermédiaire - Limite 500K FCFA'
  },
  3: {
    level: 3,
    maxLoanAmount: Infinity,
    requiredDocuments: ['Informations basiques', 'Pièce d\'identité', 'Justificatif de domicile', 'Justificatif de revenu'],
    description: 'Niveau avancé - Sans limite'
  }
};
