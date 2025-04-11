
/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currency The currency code (e.g., 'FCFA', 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  // Format for West African CFA Franc
  if (currency === 'FCFA' || currency === 'XOF') {
    return amount.toLocaleString('fr-FR') + ' ' + currency;
  }
  
  // Format for other currencies using Intl.NumberFormat
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a percentage value
 * @param value The percentage value (e.g., 0.05 for 5%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

/**
 * Format a date to a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
