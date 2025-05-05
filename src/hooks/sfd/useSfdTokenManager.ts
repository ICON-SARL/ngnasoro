
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SfdData } from './types';

// Define a return type for this hook
export interface UseSfdTokenManagerReturn {
  getToken: (sfdId: string) => Promise<string | null>;
  refreshToken: (sfdId: string) => Promise<string | null>;
  refreshTokenIfNeeded: (sfdId: string) => Promise<boolean>;
  generateTokenForSfd: (sfdId: string, userId?: string) => Promise<string | null>;
}

export function useSfdTokenManager(): UseSfdTokenManagerReturn {
  const [sfdTokens, setSfdTokens] = useState<Map<string, { token: string; expires: Date }>>(new Map());
  
  // Check if a token is expired (or will expire in the next 5 minutes)
  const isTokenExpired = (expires: Date): boolean => {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    return expires <= fiveMinutesFromNow;
  };
  
  // Get a token for an SFD
  const getToken = useCallback(async (sfdId: string): Promise<string | null> => {
    const tokenData = sfdTokens.get(sfdId);
    
    if (tokenData && !isTokenExpired(tokenData.expires)) {
      return tokenData.token;
    }
    
    // If no token or expired, refresh it
    return refreshToken(sfdId);
  }, [sfdTokens]);
  
  // Refresh a token for an SFD
  const refreshToken = useCallback(async (sfdId: string): Promise<string | null> => {
    try {
      // Call an API to get a new token
      const { data, error } = await supabase.functions.invoke('generate-sfd-token', {
        body: { sfdId }
      });
      
      if (error || !data?.token) {
        throw new Error(error?.message || 'Failed to generate token');
      }
      
      // Calculate expiry (e.g., 1 hour from now)
      const expires = new Date(new Date().getTime() + 60 * 60 * 1000);
      
      // Update the token in state
      setSfdTokens(prev => {
        const newMap = new Map(prev);
        newMap.set(sfdId, { token: data.token, expires });
        return newMap;
      });
      
      return data.token;
    } catch (error) {
      console.error('Error refreshing SFD token:', error);
      return null;
    }
  }, []);
  
  // Helper function to refresh token if needed
  const refreshTokenIfNeeded = useCallback(async (sfdId: string): Promise<boolean> => {
    const tokenData = sfdTokens.get(sfdId);
    
    if (!tokenData || isTokenExpired(tokenData.expires)) {
      const newToken = await refreshToken(sfdId);
      return !!newToken;
    }
    
    return true;
  }, [sfdTokens, refreshToken]);
  
  // Generate a token for an SFD and a user
  const generateTokenForSfd = useCallback(async (sfdId: string, userId?: string): Promise<string | null> => {
    try {
      // Call the token generation function
      const { data, error } = await supabase.functions.invoke('generate-sfd-token', {
        body: { sfdId, userId }
      });
      
      if (error || !data?.token) {
        throw new Error(error?.message || 'Failed to generate token');
      }
      
      return data.token;
    } catch (error) {
      console.error('Error generating SFD token:', error);
      return null;
    }
  }, []);

  return {
    getToken,
    refreshToken,
    refreshTokenIfNeeded,
    generateTokenForSfd
  };
}
