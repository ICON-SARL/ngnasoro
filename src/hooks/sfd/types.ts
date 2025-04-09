
// Define interfaces to avoid circular imports
export interface SfdBalanceData {
  balance: number;
  currency: string;
  sfdName?: string;    // Added to match usage in useSfdAccount.ts
  name?: string;       // Added for compatibility
  logoUrl?: string;    // Added to match usage in useSfdAccount.ts
  logo_url?: string;   // Added for compatibility
  code?: string;       // Added to match usage in useSfdAccount.ts
  region?: string;     // Added to match usage in useSfdAccount.ts
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

export interface UserSfd {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code?: string;
    region?: string;
    logo_url?: string;
    logoUrl?: string; // Added for consistency
  };
}

// Update SfdAccount to be more consistent with property naming
export interface SfdAccount {
  id: string;
  name: string;
  logo_url?: string | null;  // Use logo_url consistently
  logoUrl?: string;          // Keep logoUrl for backward compatibility
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
  loans?: SfdLoan[];
}

// Update SfdLoan to include all needed properties
export interface SfdLoan {
  id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date: string;
  last_payment_date: string;
  status: string;
  created_at: string;
  // Add missing properties that are used in components
  remainingAmount?: number;
  isLate?: boolean;
  nextDueDate?: string;
}

export interface SfdData {
  id: string;
  name: string;
  token: string | null;
  lastFetched: Date | null;
  region?: string;
  code?: string;
  logo_url?: string;
  logoUrl?: string; // Added for consistency
  status?: 'active' | 'inactive' | string;
}

export interface QRCodeRequest {
  userId: string;
  amount: number;
  purpose: string;
  loanId?: string;
  isWithdrawal?: boolean;
}

// Make sure we're importing the Loan type from the main types file
import { Loan } from '@/types/sfdClients';

// Loan pagination data type to match what's used in useLoansPage.ts
export interface LoanPaginationData {
  loans: Loan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
