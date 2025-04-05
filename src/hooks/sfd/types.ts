
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

// Import types from sfdAccountsApi.ts
import type { SfdBalanceData, UserSfd, SyncResult, LoanPaymentParams } from "./sfdAccountsApi";
export type { SfdBalanceData, UserSfd, SyncResult, LoanPaymentParams };
