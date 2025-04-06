
// Define a more generic account type that works with both data sources
export interface SfdAccountDisplay {
  id: string;
  name: string;
  logoUrl?: string;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
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
