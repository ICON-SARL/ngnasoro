
/**
 * Utility functions for formatting data
 */

/**
 * Formats a date string to a localized format
 * @param dateString - ISO date string to format
 * @param includeTime - Whether to include the time in the formatted output
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined, includeTime: boolean = false): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    if (includeTime) {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return '-';
  }
};

/**
 * Formats a number as currency (FCFA)
 * @param amount - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - Text to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string | null | undefined, length: number = 30): string => {
  if (!text) return '';
  
  return text.length > length ? `${text.substring(0, length)}...` : text;
};
