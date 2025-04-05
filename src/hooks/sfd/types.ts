
// Import User type from auth/types instead of useAuth
import type { User } from "@/hooks/auth/types";

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

// Define these types inline to prevent circular imports
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
  };
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

// Add mobile money types
export interface MobileMoneyProvider {
  id: string;
  name: string;
  code: string;
  icon: string;
}

export interface MobileMoneyPaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

// Add QRCode types
export interface QRCodeRequest {
  userId: string;
  amount: number;
  loanId?: string;
  isWithdrawal: boolean;
}
