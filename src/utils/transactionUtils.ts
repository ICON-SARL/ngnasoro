
/**
 * Formats a number as currency amount
 * @param amount Number to format
 * @param prefix Currency prefix (e.g. "$")
 * @returns Formatted amount string
 */
export const formatCurrencyAmount = (amount: number, prefix: string = ""): string => {
  if (amount === undefined || amount === null) return `${prefix}0`;
  
  return `${prefix}${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Gets a color for a transaction type
 * @param type Transaction type
 * @returns CSS color class
 */
export const getTransactionTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'deposit':
    case 'loan_disbursement':
      return 'text-green-600';
    case 'withdrawal':
    case 'loan_repayment':
      return 'text-red-600';
    case 'transfer':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Gets a label for a transaction type
 * @param type Transaction type
 * @returns Human-readable label
 */
export const getTransactionTypeLabel = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'Dépôt';
    case 'withdrawal':
      return 'Retrait';
    case 'loan_disbursement':
      return 'Décaissement prêt';
    case 'loan_repayment':
      return 'Remboursement prêt';
    case 'transfer':
      return 'Transfert';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};
