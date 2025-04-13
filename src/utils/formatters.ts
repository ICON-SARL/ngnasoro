
/**
 * Utility functions for formatting values throughout the application
 */

/**
 * Format a date string into a locale-friendly format
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: FCFA)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
  try {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + currency;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currency}`;
  }
};

/**
 * Format a phone number in a readable way
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Basic formatting for West African phone numbers
  if (!phoneNumber) return '';
  
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as XX XX XX XX XX (typical for West African numbers)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phoneNumber;
};
