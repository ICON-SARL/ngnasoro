
/**
 * Formate une date en format localisé
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formate un montant en FCFA
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currency The currency code (e.g., 'FCFA', 'USD', 'EUR')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
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
};
