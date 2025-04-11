
/**
 * Formate une date en format local français
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}): string {
  try {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    // Options par défaut pour le format de date
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      ...options
    };
    
    return date.toLocaleDateString('fr-FR', defaultOptions);
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return dateString || 'Date inconnue';
  }
}

/**
 * Formate un nombre en devise avec le symbole spécifié
 */
export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  try {
    // Formater le nombre avec séparateurs de milliers
    const formattedAmount = new Intl.NumberFormat('fr-FR').format(amount);
    
    return `${formattedAmount} ${currency}`;
  } catch (error) {
    console.error('Erreur de formatage de devise:', error);
    return `${amount} ${currency}`;
  }
}
