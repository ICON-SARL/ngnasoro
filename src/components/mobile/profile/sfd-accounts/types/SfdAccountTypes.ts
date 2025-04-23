

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

// Updated to match the structure used in useSfdAdhesion.ts
export interface AvailableSfd {
  id: string;
  name: string;
  code: string;  // Keep this required for backward compatibility
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
}

