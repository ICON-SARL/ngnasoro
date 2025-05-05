
export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Mise à jour pour être compatible avec l'interface utilisée partout
export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
}

export interface SfdAccountDisplay {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
  code?: string;
  region?: string;
  logo_url?: string;
  is_default: boolean;
  isVerified: boolean;
  isActive?: boolean; // Added this property
  status?: string; 
  description?: string;
  logo?: string; // Added for compatibility with some components
}

// Helper function to check if balance can be displayed
export function canDisplayBalance(account: SfdAccountDisplay): boolean {
  return account?.isVerified !== false && 
    (account?.status === 'active' || account?.status === undefined);
}
