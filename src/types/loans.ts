
export interface LoanStatus {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  nextPaymentDue: string;
  dueAmount?: number;
  paymentHistory: {
    id: number;
    date: string;
    amount: number;
    status: string;
  }[];
  status?: 'pending' | 'approved' | 'disbursed' | 'completed' | 'rejected';
  disbursement_status?: string;
  next_payment_date?: string;
  last_payment_date?: string;
  progress: number;
  lateFees: number;
  disbursed: boolean;
  withdrawn: boolean;
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
