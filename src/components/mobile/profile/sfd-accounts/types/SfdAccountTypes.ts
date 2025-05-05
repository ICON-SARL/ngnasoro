
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
  status?: string;
  description?: string; // Added this property
  logo?: string; // Added for compatibility with some components
}
