
/**
 * Format a date into a readable string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format currency with proper separators and currency symbol
 */
export const formatCurrency = (amount: number | string, currency: string = 'FCFA'): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `0 ${currency}`;
  }
  
  return `${numericAmount.toLocaleString('fr-FR')} ${currency}`;
};

/**
 * Format a number for display
 */
export const formatNumber = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0';
  }
  
  return numericValue.toLocaleString('fr-FR');
};

/**
 * Format a phone number with proper spacing
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  
  // If the format doesn't match, return the original
  return phoneNumber;
};

/**
 * Safely convert a value to number
 */
export const toNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format transaction amount with sign and currency
 */
export const formatTransactionAmount = (amount: string | number, type: string): string => {
  const numericAmount = toNumber(amount);
  
  const isPositive = type === 'deposit' || type === 'loan_disbursement';
  const sign = isPositive ? '+' : '-';
  
  return `${sign}${Math.abs(numericAmount).toLocaleString('fr-FR')} FCFA`;
};
