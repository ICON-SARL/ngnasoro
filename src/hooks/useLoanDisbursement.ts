
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface DisbursementPayload {
  loanId: string;
  amount: number;
  method: 'bank_transfer' | 'cash' | 'mobile_money';
  notes?: string;
}

export function useLoanDisbursement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const disburseLoan = useMutation({
    mutationFn: async (payload: DisbursementPayload) => {
      if (!user?.id) {
        throw new Error("User must be authenticated");
      }

      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('loan-manager', {
          body: {
            action: 'disburse_loan',
            data: {
              payload: {
                ...payload,
                disbursedBy: user.id
              }
            }
          }
        });

        if (error) throw error;
        return data;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: "Décaissement effectué",
        description: "Le prêt a été décaissé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de décaissement",
        description: error.message || "Une erreur est survenue lors du décaissement",
        variant: "destructive",
      });
    }
  });

  return {
    disburseLoan,
    isProcessing
  };
}
