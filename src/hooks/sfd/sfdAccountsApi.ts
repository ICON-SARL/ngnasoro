import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

export interface SfdAccount {
  id: string;
  name: string;
  code: string;
  region: string;
  logoUrl: string | null;
  isDefault: boolean;
  balance: number;
  currency: string;
}

export function useSfdAccountsApi() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getAccounts = async (): Promise<SfdAccount[]> => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await edgeFunctionApi.callFunction('sfd-accounts', {
        action: 'getSfdAccounts'
      });
      
      if (error) {
        throw error;
      }
      
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching SFD accounts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer vos comptes SFD',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const requestSfdAccess = async (sfdId: string, phoneNumber?: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour effectuer cette action',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await edgeFunctionApi.callFunction('sfd-accounts', {
        action: 'requestSfdAccess',
        data: {
          sfdId,
          phoneNumber
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.success) {
        throw new Error(data?.message || 'Échec de la demande d\'accès');
      }
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été envoyée avec succès',
      });
      
      return true;
    } catch (error) {
      console.error('Error requesting SFD access:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer votre demande',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const synchronizeAccounts = async (forceSync = false): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await edgeFunctionApi.callFunction('sfd-accounts', {
        action: 'synchronizeSfdAccounts',
        data: {
          forceSync
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data?.success || false;
    } catch (error) {
      console.error('Error synchronizing accounts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de synchroniser vos comptes',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getAccounts,
    requestSfdAccess,
    synchronizeAccounts
  };
}
