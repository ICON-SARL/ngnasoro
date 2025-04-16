
// This file is now a facade that re-exports the refactored services
// to maintain backward compatibility
import { 
  createLoan, 
  getSfdLoans, 
  fetchLoanById, 
  approveLoan, 
  rejectLoan,
  disburseLoan,
  recordLoanPayment,
  getLoanPayments,
  sendPaymentReminder
} from "@/services/loans/loanService";

// Export everything from the new modular API
export const loanService = {
  createLoan,
  getSfdLoans,
  fetchLoanById,
  approveLoan,
  rejectLoan,
  disburseLoan,
  recordLoanPayment,
  getLoanPayments,
  sendPaymentReminder
};

// For backward compatibility with code still using sfdLoanApi directly
export const sfdLoanApi = {
  // Loan operations
  createLoan,
  getSfdLoans,
  getLoanById: fetchLoanById, // Updated to match the actual function name
  approveLoan,
  rejectLoan,
  disburseLoan,
  recordLoanPayment,
  getLoanPayments,
  sendPaymentReminder
};
