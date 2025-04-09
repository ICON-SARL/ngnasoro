
// Define a more generic account type that works with both data sources
export interface SfdAccountDisplay {
  id: string;
  name: string;
  logoUrl?: string;
  logo_url?: string; // Keep both property names for compatibility
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
  status?: 'active' | 'pending' | 'inactive';
}

// Type for SFDs available to connect to
export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  status: string;
}

// Type for SFD client request status
export interface SfdClientRequest {
  id: string;
  sfd_id: string;
  status: 'pending' | 'validated' | 'rejected' | string; // Allow any string to accommodate database values
  created_at: string;
}

// Create a dialog component to discover and connect to SFDs
export interface DiscoverSfdDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSent?: () => void;
}
