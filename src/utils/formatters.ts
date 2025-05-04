
/**
 * Format a currency amount with thousand separators
 * @param amount The amount to format
 * @param currency The currency symbol/code to append (optional)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency?: string): string => {
  const formattedAmount = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
};

/**
 * Format a number with thousand separators and specified decimal places
 * @param number The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (number: number, decimals = 2): string => {
  return number.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format a date to a human-readable string
 * @param date Date object or string
 * @param includeTime Whether to include the time
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, includeTime = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format a monetary amount for display in transactions
 * @param amount The amount to format
 * @returns Formatted amount string
 */
export const formatMonetaryAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  return formatCurrency(absAmount);
};
