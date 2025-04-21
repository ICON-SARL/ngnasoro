
// Re-export all loan-related functions from one place
export * from './loanQueries';
export * from './loanMutations';

// Re-export from loanPaymentService with explicit naming to avoid conflicts
import { 
  recordLoanPayment as recordPayment,
  getLoanPayments as getPayments,
  sendPaymentReminder as sendReminder
} from './loanPaymentService';

export {
  recordPayment,
  getPayments,
  sendReminder
};
