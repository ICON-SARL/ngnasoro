
export interface SfdAccountDisplay {
  id: string;
  name: string;
  logoUrl?: string | null;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
  status?: string;
}
