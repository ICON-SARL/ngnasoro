
export type LoanApplicationStep = 'start' | 'purpose' | 'amount' | 'duration' | 'location' | 'review' | 'complete';

export interface StepConfig {
  title: string;
  voiceMessage: string;
  nextLabel: string;
  prevLabel?: string;
  icon: React.ReactNode;
  progress: number;
}

export interface PurposeOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export interface LoanStatus {
  nextPaymentDue: string;
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  progress: number;
  lateFees: number;
  paymentHistory: Array<{
    id: number;
    date: string;
    amount: number;
    status: string;
  }>;
  disbursed: boolean;
  withdrawn: boolean;
}
