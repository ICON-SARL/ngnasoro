
import { User } from "@/hooks/useAuth";

export interface SfdData {
  id: string;
  name: string;
  token: string | null;
  lastFetched: Date | null;
}

export interface SfdDataAccess {
  sfdData: SfdData[];
  loading: boolean;
  error: string | null;
  activeSfdId: string | null;
  fetchUserSfds: () => Promise<void>;
  switchActiveSfd: (sfdId: string) => Promise<boolean>;
  getActiveSfdData: () => Promise<SfdData | null>;
  getCurrentSfdToken: () => Promise<string | null>;
}

export interface SfdAccount {
  id: string;
  name: string;
  logoUrl?: string;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface UserSfd {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code?: string;
    region?: string;
    logo_url?: string;
  }
}

export interface SyncResult {
  success: boolean;
  message?: string;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  method?: string;
}
