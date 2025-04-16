
/**
 * Fetches loans associated with a specific SFD
 */
export async function fetchSfdLoans(userId: string, sfdId: string) {
  try {
    console.log('fetchSfdLoans called with:', { userId, sfdId });
    
    // Validate input parameters
    if (!userId || !sfdId) {
      console.warn('Missing required parameters:', { userId, sfdId });
      return [];
    }
    
    // For test accounts, return empty loans array
    if (userId.includes('test') || sfdId.includes('test') || 
        ['premier-sfd-id', 'deuxieme-sfd-id', 'troisieme-sfd-id'].includes(sfdId)) {
      return [];
    }
    
    try {
      const { apiClient } = await import('@/utils/apiClient');
      const loansData = await apiClient.getSfdLoans(userId, sfdId);
      return loansData;
    } catch (error) {
      console.error('API client error in fetchSfdLoans:', error);
      // Fall back to local data or return empty array
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch SFD loans:', error);
    return [];
  }
}
