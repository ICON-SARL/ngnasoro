
// This file is now a facade that re-exports the refactored services
// to maintain backward compatibility
import * as loanService from "@/services/loans";

// Export everything from the new modular API
export { loanService };

// For backward compatibility with code still using sfdLoanApi directly
export const sfdLoanApi = {
  // Loan operations
  createLoan: loanService.createLoan,
  getSfdLoans: loanService.getSfdLoans,
  getLoanById: loanService.getLoanById,
  approveLoan: loanService.approveLoan,
  rejectLoan: loanService.rejectLoan,
  disburseLoan: loanService.disburseLoan,
  recordLoanPayment: loanService.recordLoanPayment,
  getLoanPayments: loanService.getLoanPayments,
  sendPaymentReminder: loanService.sendPaymentReminder
};
