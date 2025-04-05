
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

// Import specific types from sfdAccountsApi.ts instead of the whole file
// This breaks the circular dependency
import type { SfdBalanceData, UserSfd, SyncResult, LoanPaymentParams } from "./sfdAccountsApi";
export type { SfdBalanceData, UserSfd, SyncResult, LoanPaymentParams };

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
