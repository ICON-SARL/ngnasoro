
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SfdData } from '@/hooks/sfd/types';

interface SfdToken {
  token: string;
  expiresAt: number;
}

export interface UseSfdTokenManagerReturn {
  getToken: (sfdId: string) => Promise<string | null>;
  refreshToken: (sfdId: string) => Promise<string | null>;
  isLoading: boolean;
  error: Error | null;
}

export function useSfdTokenManager(): UseSfdTokenManagerReturn {
  const [tokens, setTokens] = useState<Record<string, SfdToken>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Function to refresh the token for a specific SFD
  const refreshToken = async (sfdId: string): Promise<string | null> => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call an API or edge function to get a new token
      const { data, error } = await supabase.functions.invoke('get-sfd-token', {
        body: { sfdId, userId: user.id }
      });
      
      if (error) throw new Error(error.message);
      
      if (!data?.sfd?.token) {
        throw new Error('No token received from server');
      }
      
      const newToken: SfdToken = {
        token: data.sfd.token,
        expiresAt: Date.now() + (data.expiresIn || 3600) * 1000
      };
      
      setTokens(prev => ({
        ...prev,
        [sfdId]: newToken
      }));
      
      return newToken.token;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh token';
      console.error(errorMessage);
      setError(new Error(errorMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get a token, refreshing if necessary
  const getToken = async (sfdId: string): Promise<string | null> => {
    const currentToken = tokens[sfdId];
    
    // If we have a valid token that hasn't expired, return it
    if (currentToken && currentToken.token && currentToken.expiresAt > Date.now()) {
      return currentToken.token;
    }
    
    // Otherwise, refresh the token
    return refreshToken(sfdId);
  };

  return {
    getToken,
    refreshToken,
    isLoading,
    error
  };
}
