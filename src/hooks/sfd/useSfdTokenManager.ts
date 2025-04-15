
import { useCallback } from 'react';
import { 
  generateSfdContextToken, 
  refreshSfdContextToken, 
  shouldRefreshSfdToken 
} from '@/utils/sfdJwtContext';
import { SfdData } from './types';

export function useSfdTokenManager(sfdData: SfdData[], setSfdData: React.Dispatch<React.SetStateAction<SfdData[]>>) {
  // Generate a new token for a specific SFD
  const generateTokenForSfd = useCallback(async (userId: string, sfdId: string): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const token = await generateSfdContextToken(userId, sfdId);
      
      // Update the token in our state
      setSfdData(prev => prev.map(sfd => 
        sfd.id === sfdId 
          ? { ...sfd, token, lastFetched: new Date() } 
          : sfd
      ));
      
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      return null;
    }
  }, [setSfdData]);

  // Refresh a token if needed
  const refreshTokenIfNeeded = useCallback(async (userId: string, sfdId: string): Promise<string | null> => {
    const sfd = sfdData.find(s => s.id === sfdId);
    if (!sfd) {
      return generateTokenForSfd(userId, sfdId);
    }
    
    try {
      // Check if token needs refresh
      if (!sfd.token) {
        return generateTokenForSfd(userId, sfdId);
      }
      
      const needsRefresh = await shouldRefreshSfdToken(sfd.token);
      
      if (needsRefresh) {
        // Token needs refresh, get a new one
        const refreshedToken = await refreshSfdContextToken(sfd.token);
        
        if (refreshedToken) {
          // Update token in state
          setSfdData(prev => prev.map(s => 
            s.id === sfdId 
              ? { ...s, token: refreshedToken, lastFetched: new Date() } 
              : s
          ));
          
          return refreshedToken;
        } else {
          // If refresh failed, generate a new token
          return generateTokenForSfd(userId, sfdId);
        }
      }
      
      // Token is still valid
      return sfd.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return generateTokenForSfd(userId, sfdId);
    }
  }, [sfdData, generateTokenForSfd, setSfdData]);

  return {
    generateTokenForSfd,
    refreshTokenIfNeeded
  };
}
