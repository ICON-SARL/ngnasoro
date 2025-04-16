
/**
 * Fetches loans associated with a specific SFD
 */
export async function fetchSfdLoans(userId: string, sfdId: string) {
  try {
    // For test accounts, return empty loans array
    if (userId.includes('test') || sfdId.includes('test') || 
        ['premier-sfd-id', 'deuxieme-sfd-id', 'troisieme-sfd-id'].includes(sfdId)) {
      return [];
    }
    
    const { apiClient } = await import('@/utils/apiClient');
    const loansData = await apiClient.getSfdLoans(userId, sfdId);
    return loansData;
  } catch (error) {
    console.error('Failed to fetch SFD loans:', error);
    return [];
  }
}
