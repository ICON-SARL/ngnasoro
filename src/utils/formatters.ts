
/**
 * Formate une date en chaîne de caractères dans un format localisé
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Jamais connecté';
  
  try {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    // Format: "15 avril 2023, 14:30"
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Erreur de date';
  }
};

/**
 * Formate un montant en devise avec le code de devise par défaut (FCFA)
 * @param amount Le montant à formater
 * @param currency Le code de devise (par défaut 'FCFA')
 * @returns Chaîne formatée
 */
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
  // Format pour le Franc CFA d'Afrique de l'Ouest
  if (currency === 'FCFA' || currency === 'XOF') {
    return amount.toLocaleString('fr-FR') + ' ' + currency;
  }
  
  // Format pour les autres devises en utilisant Intl.NumberFormat
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
