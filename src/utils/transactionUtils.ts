
/**
 * Format a currency amount as a string with FCFA
 */
export function formatCurrencyAmount(amount: number | undefined, currency: string = 'FCFA'): string {
  if (amount === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(amount);
}

/**
 * Get an appropriate color for a transaction type
 */
export function getTransactionTypeColor(type: string): string {
  switch(type) {
    case 'deposit': 
      return 'text-green-600';
    case 'withdrawal':
      return 'text-red-600';
    case 'transfer':
      return 'text-blue-600';
    case 'loan_repayment':
      return 'text-purple-600';
    case 'loan_disbursement':
      return 'text-emerald-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get an appropriate background color for a transaction type
 */
export function getTransactionTypeBgColor(type: string): string {
  switch(type) {
    case 'deposit': 
      return 'bg-green-100';
    case 'withdrawal':
      return 'bg-red-100';
    case 'transfer':
      return 'bg-blue-100';
    case 'loan_repayment':
      return 'bg-purple-100';
    case 'loan_disbursement':
      return 'bg-emerald-100';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Get a sign (+ or -) based on transaction type
 */
export function getTransactionSign(type: string): string {
  switch(type) {
    case 'deposit':
    case 'loan_disbursement':
      return '+';
    case 'withdrawal':
    case 'loan_repayment':
    case 'transfer':
      return '-';
    default:
      return '';
  }
}
