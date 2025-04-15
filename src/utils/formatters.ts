
/**
 * Formate une date au format français
 * @param dateString Chaîne de date à formater
 * @returns Date formatée (ex: "01/01/2023")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formate un montant avec séparateur de milliers
 * @param amount Montant à formater
 * @param currency Devise (optionnel)
 * @returns Montant formaté (ex: "1 000 XOF")
 */
export const formatAmount = (amount: number, currency?: string): string => {
  const formattedAmount = amount.toLocaleString('fr-FR');
  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
};

/**
 * Formate un montant en devise
 * @param amount Montant à formater
 * @param currency Devise (par défaut: 'FCFA')
 * @returns Montant formaté avec devise (ex: "1 000 FCFA")
 */
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
};
