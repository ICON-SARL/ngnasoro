
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { Loan } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSfdLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['sfd-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) {
        throw new Error('Failed to fetch client data');
      }

      if (!clientsData?.length) {
        return [];
      }

      const clientIds = clientsData.map(client => client.id);

      const { data: loans, error: loansError } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          sfds:sfd_id (
            name,
            logo_url
          )
        `)
        .in('client_id', clientIds)
        .order('created_at', { ascending: false });

      if (loansError) {
        throw loansError;
      }

      return loans || [];
    },
    meta: {
      errorMessage: "Impossible de charger vos prêts"
    }
  });

  // Create loan mutation
  const createLoan = useMutation({
    mutationFn: (loanData: any) => sfdLoanApi.createLoan(loanData),
    onSuccess: () => {
      toast({
        title: "Prêt créé",
        description: "Le prêt a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du prêt",
        variant: "destructive",
      });
    }
  });

  // Approve loan mutation
  const approveLoan = useMutation({
    mutationFn: (params: { loanId: string }) => sfdLoanApi.approveLoan(params.loanId, user?.id || ''),
    onSuccess: () => {
      toast({
        title: "Prêt approuvé",
        description: "Le prêt a été approuvé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    }
  });

  // Reject loan mutation
  const rejectLoan = useMutation({
    mutationFn: (params: { loanId: string, reason?: string }) => sfdLoanApi.rejectLoan(params.loanId, user?.id || '', params.reason),
    onSuccess: () => {
      toast({
        title: "Prêt rejeté",
        description: "Le prêt a été rejeté",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    }
  });

  // Disburse loan mutation
  const disburseLoan = useMutation({
    mutationFn: (params: { loanId: string }) => sfdLoanApi.disburseLoan(params.loanId, user?.id || ''),
    onSuccess: () => {
      toast({
        title: "Prêt décaissé",
        description: "Le prêt a été décaissé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    }
  });

  // Record payment mutation
  const recordPayment = useMutation({
    mutationFn: ({ loanId, amount, paymentMethod }: { loanId: string, amount: number, paymentMethod: string }) => 
      sfdLoanApi.recordLoanPayment(loanId, amount, paymentMethod, user?.id || ''),
    onSuccess: () => {
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    }
  });

  return {
    data,
    isLoading,
    error,
    loans: data, // Add loans as an alias of data for backward compatibility
    createLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    recordPayment
  };
}
