
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
