
// Réexporter uniquement ce qui ne provoque pas de conflit
export * from './loanQueries';
export * from './loanMutations';

// Réexporter explicitement les fonctions de loanPayments
export { recordLoanPayment, sendPaymentReminder } from './loanPayments';
