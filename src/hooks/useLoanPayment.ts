
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { supabase } from '@/integrations/supabase/client';

export function useLoanPayment(loanId: string | undefined) {
  const { toast } = useToast();
  const { getActiveSfdData } = useSfdDataAccess();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMobileMoneyPayment = async (): Promise<boolean> => {
    if (!loanId) {
      toast({
        title: "Erreur",
        description: "Identifiant de prêt manquant",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsProcessing(true);
      
      const activeSfd = await getActiveSfdData();
      
      if (!activeSfd) {
        throw new Error("Impossible de récupérer les données SFD");
      }
      
      const { data, error } = await supabase.functions.invoke('mobile-money-authorization', {
        body: {
          sfdId: activeSfd.id,
          loanId: loanId,
          action: 'payment',
          amount: 0 // Will be determined on the server
        }
      });
      
      if (error) throw error;
      
      if (data?.authorized) {
        toast({
          title: "Paiement Mobile Money initié",
          description: "Vérifiez votre téléphone pour confirmer le paiement",
        });
        return true;
      } else {
        throw new Error("Paiement non autorisé par le SFD");
      }
    } catch (error: any) {
      console.error('Mobile Money error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation du paiement",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleMobileMoneyPayment
  };
}
