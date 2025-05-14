
export interface LoanStatus {
  nextPaymentDue: string;
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  progress: number;
  lateFees: number;
  paymentHistory: LoanPayment[];
  disbursed: boolean;
  withdrawn: boolean;
  status?: string;
  disbursement_status?: string;
}

export interface LoanPayment {
  id: number;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'late';
}

export interface LoanDetails {
  loanType: string;
  loanPurpose: string;
  totalAmount: number;
  disbursalDate: string;
  endDate: string;
  interestRate: number;
  status: string;
  disbursed: boolean;
  withdrawn: boolean;
}

export interface CreateLoanInput {
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  purpose: string;
  loan_plan_id?: string;
  monthly_payment?: number;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  purpose: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'defaulted' | string;
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  monthly_payment: number;
  client_name?: string;
  reference?: string;
  subsidy_amount?: number;
  subsidy_rate?: number;
  loan_plan_id?: string;
  sfd_clients?: {
    full_name: string;
    email: string;
    phone: string;
  };
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface LoanApplication {
  sfd_id: string;
  loan_plan_id?: string;
  amount: number;
  duration_months: number;
  purpose: string;
  interest_rate?: number;
}

export enum LoanDocumentType {
  ID_CARD = 'id_card',
  PROOF_OF_INCOME = 'proof_of_income',
  BANK_STATEMENT = 'bank_statement',
  OTHER = 'other'
}
