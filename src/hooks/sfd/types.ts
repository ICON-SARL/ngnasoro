
import { User } from "@/hooks/useAuth";

export interface SfdAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  logoUrl?: string;
  region?: string;
  code?: string;
  isDefault?: boolean;
  loans?: SfdLoan[];
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface UserSfd {
  sfds: {
    id: string;
    name: string;
    logo_url?: string;
    region?: string;
    code?: string;
  };
  is_default: boolean;
}

export interface SyncResult {
  success: boolean;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
}
