
// Re-export all loan-related services from a single file
// This maintains the same API to prevent breaking changes

import { loanService } from "./loanService";
import { loanApprovalService } from "./loanApprovalService";
import { loanPaymentService } from "./loanPaymentService";
import { loanNotificationService } from "./loanNotificationService";

// Combine all services into a single API that matches the original sfdLoanApi
export const sfdLoanApi = {
  // From loanService
  getSfdLoans: loanService.getSfdLoans,
  getLoanById: loanService.getLoanById,
  createLoan: loanService.createLoan,
  
  // From loanApprovalService
  approveLoan: loanApprovalService.approveLoan,
  rejectLoan: loanApprovalService.rejectLoan,
  disburseLoan: loanApprovalService.disburseLoan,
  
  // From loanPaymentService
  recordLoanPayment: loanPaymentService.recordLoanPayment,
  getLoanPayments: loanPaymentService.getLoanPayments,
  
  // From loanNotificationService
  sendPaymentReminder: loanNotificationService.sendPaymentReminder,
};
