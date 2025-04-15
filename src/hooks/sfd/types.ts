
export interface SfdClientAccount {
  id: string;
  name: string;
  logoUrl: string | null;
  logo_url: string | null;
  code: string;
  region: string;
  balance: number;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
  status: string;
  sfd_id: string;
  account_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  loans: any[];
}
