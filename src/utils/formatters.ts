
/**
 * Formate une date en format lisible
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  
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
    console.error('Erreur lors du formatage de la date:', error);
    return dateString;
  }
}

/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount?: number | string): string {
  if (amount === undefined || amount === null) return '-';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '-';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(numericAmount);
}

/**
 * Formate un numéro de téléphone
 */
export function formatPhoneNumber(phoneNumber?: string): string {
  if (!phoneNumber) return '-';
  
  // Format simple pour les numéros africains (ex: XX XXX XX XX)
  // Adapté selon les standards locaux
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  
  return phoneNumber;
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}
