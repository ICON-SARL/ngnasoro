
import { User } from '@supabase/supabase-js';

export interface UserSfd {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code: string;
    region: string;
    logo_url: string | null;
  };
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

export interface SfdAccount {
  id: string;
  name: string;
  logoUrl: string | null;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
  loans?: SfdLoan[];
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
}

export interface SyncUpdate {
  sfdId: string;
  name: string;
  newBalance: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  updates: SyncUpdate[];
}
