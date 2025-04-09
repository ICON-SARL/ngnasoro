
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { useSfdDataAccess } from '../useSfdDataAccess';
import { MobileMoneyOperationsHook } from './types';
import { supabase } from '@/integrations/supabase/client';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { getActiveSfdData } = useSfdDataAccess();
  
  // Liste des opérateurs Mobile Money disponibles
  const mobileMoneyProviders = [
    { 
      id: 'orange', 
      name: 'Orange Money', 
      code: 'OM',
      icon: '/icons/orange-money.svg' 
    },
    { 
      id: 'mtn', 
      name: 'MTN Mobile Money', 
      code: 'MTN',
      icon: '/icons/mtn-money.svg' 
    },
    { 
      id: 'wave', 
      name: 'Wave', 
      code: 'WAVE',
      icon: '/icons/wave.svg' 
    }
  ];
  
  // Fournisseur par défaut
  const defaultProvider = 'orange';
  
  // Fonction pour traiter un paiement
  const processPayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Obtenir les données SFD actives
      const sfdData = await getActiveSfdData();
      
      if (!sfdData) {
        throw new Error('Impossible de récupérer les données SFD');
      }
      
      // Appeler la fonction Supabase Edge pour traiter le paiement
      const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
        body: {
          action: 'mobileMoney',
          userId: user.id,
          phoneNumber,
          amount,
          provider,
          isWithdrawal: false
        }
      });
      
      if (error) throw error;
      
      return data?.success === true;
    } catch (error: any) {
      console.error('Erreur lors du traitement du paiement Mobile Money:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fonction pour traiter un retrait
  const processWithdrawal = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Obtenir les données SFD actives
      const sfdData = await getActiveSfdData();
      
      if (!sfdData) {
        throw new Error('Impossible de récupérer les données SFD');
      }
      
      // Appeler la fonction Supabase Edge pour traiter le retrait
      const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
        body: {
          action: 'mobileMoney',
          userId: user.id,
          phoneNumber,
          amount,
          provider,
          isWithdrawal: true
        }
      });
      
      if (error) throw error;
      
      return data?.success === true;
    } catch (error: any) {
      console.error('Erreur lors du traitement du retrait Mobile Money:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    mobileMoneyProviders,
    defaultProvider,
    isProcessing,
    processPayment,
    processWithdrawal
  };
}
