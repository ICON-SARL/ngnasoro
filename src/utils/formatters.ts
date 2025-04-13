
/**
 * Formats a number as currency in FCFA
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Formats a date string to localized format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formats a percentage
 * @param value Number value
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
