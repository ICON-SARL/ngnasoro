
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
