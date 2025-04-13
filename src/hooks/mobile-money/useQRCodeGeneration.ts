
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface QRCodeGenerationHook {
  qrCodeData: string | null;
  isGenerating: boolean;
  error: string | null;
  generateQRCode: (amount: number, loanId?: string, isWithdrawal?: boolean) => Promise<string | null>;
  resetQRCode: () => void;
}

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateQRCode = async (
    amount: number, 
    loanId?: string,
    isWithdrawal: boolean = false
  ): Promise<string | null> => {
    if (!amount || amount <= 0) {
      setError("Le montant doit être supérieur à zéro");
      return null;
    }
    
    if (!user) {
      setError("Utilisateur non authentifié");
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the edge function to generate a QR code
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: {
          userId: user.id,
          amount: amount,
          type: isWithdrawal ? 'withdrawal' : loanId ? 'loan_payment' : 'deposit',
          reference: loanId ? `loan-${loanId}` : undefined,
          loanId: loanId
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.success || !data.qrData) {
        throw new Error("Échec de génération du code QR");
      }
      
      setQRCodeData(data.qrData);
      
      return data.qrData;
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setError(error.message || "Erreur lors de la génération du QR code");
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le code QR",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQRCode = () => {
    setQRCodeData(null);
    setError(null);
  };

  return {
    qrCodeData,
    isGenerating,
    error,
    generateQRCode,
    resetQRCode
  };
}
