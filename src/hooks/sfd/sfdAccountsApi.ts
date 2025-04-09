
import { SfdAccount, SfdLoan, SfdBalanceData, UserSfd, SyncResult, LoanPaymentParams } from './types';

// Re-export the fetchUserSfds and fetchSfdBalance functions
export { fetchUserSfds } from './fetchSfdAccounts';
export { fetchSfdBalance } from './fetchSfdBalance';

// Function to fetch loans for a specific SFD account
export async function fetchSfdLoans(userId: string, sfdId: string): Promise<SfdLoan[]> {
  try {
    // Mock data for demonstration
    return [
      {
        id: 'loan1',
        amount: 500000,
        duration_months: 12,
        interest_rate: 5,
        monthly_payment: 43000,
        next_payment_date: '2025-05-15',
        status: 'active',
        created_at: '2025-04-01',
        remainingAmount: 430000,
        isLate: false
      }
    ];
  } catch (error) {
    console.error(`Failed to fetch loans for SFD ${sfdId}:`, error);
    return [];
  }
}

// Function to synchronize account data
export async function synchronizeAccounts(userId: string, sfdId: string): Promise<SyncResult> {
  try {
    // Implementation would talk to your API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Accounts synchronized successfully',
      updatedAccounts: 1
    };
  } catch (error) {
    console.error('Error synchronizing accounts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to process loan payment
export async function makeLoanPayment(
  userId: string, 
  sfdId: string, 
  loanId: string, 
  amount: number
): Promise<SyncResult> {
  try {
    // Implementation would talk to your API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Payment processed successfully'
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fonction pour traiter les paiements mobile money
export async function processMobileMoneyPayment(
  userId: string | null,
  phoneNumber: string,
  amount: number,
  provider: string,
  isRepayment: boolean = false,
  loanId?: string
): Promise<SyncResult> {
  if (!userId) {
    return {
      success: false,
      message: 'User ID is required'
    };
  }
  
  try {
    console.log(`Processing mobile money ${isRepayment ? 'repayment' : 'payment'} of ${amount} via ${provider}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: isRepayment 
        ? 'Loan repayment processed successfully' 
        : 'Mobile money payment processed successfully',
      transactionId: `mm-${Date.now()}`
    };
  } catch (error) {
    console.error('Error processing mobile money payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
