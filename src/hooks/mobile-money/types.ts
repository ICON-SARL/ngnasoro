
export interface MobileMoneyProvider {
  id: string;
  name: string;
  logo?: string;
}

export interface MobileMoneyOperationsHook {
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  error: string | null;
  processPayment: (params: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
    loanId?: string;
  }) => Promise<boolean>;
  processWithdrawal: (params: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
  }) => Promise<boolean>;
  mobileMoneyProviders: MobileMoneyProvider[];
}
