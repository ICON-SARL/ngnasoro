
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '@/utils/sfdLoanApi';
import { Loan } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSfdLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all loans for the current SFD
  const { 
    data: loans = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['sfd-loans'],
    queryFn: async () => {
      return loanService.getSfdLoans();
    }
  });
  
  // Create a new loan
  const createLoan = useMutation({
    mutationFn: async (loanData: loanService.CreateLoanInput) => {
      return await loanService.createLoan(loanData);
    },
    onSuccess: () => {
      toast({
        title: "Prêt créé avec succès",
        description: "Le prêt a été créé et est en attente d'approbation",
      });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Approve a loan
  const approveLoan = useMutation({
    mutationFn: ({ loanId }: { loanId: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return loanService.approveLoan(loanId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Prêt approuvé",
        description: "Le prêt a été approuvé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'approbation",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Reject a loan
  const rejectLoan = useMutation({
    mutationFn: ({ loanId }: { loanId: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return loanService.rejectLoan(loanId, user.id, "Demande rejetée");
    },
    onSuccess: () => {
      toast({
        title: "Prêt rejeté",
        description: "Le prêt a été rejeté",
      });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de rejet",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Disburse a loan
  const disburseLoan = useMutation({
    mutationFn: ({ loanId }: { loanId: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return loanService.disburseLoan(loanId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Prêt décaissé",
        description: "Le prêt a été décaissé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de décaissement",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Record a loan payment
  const recordPayment = useMutation({
    mutationFn: ({ loanId, amount, paymentMethod }: { loanId: string, amount: number, paymentMethod: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return loanService.recordLoanPayment(loanId, amount, paymentMethod, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'enregistrement",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });
  
  // Send payment reminder
  const sendPaymentReminder = useMutation({
    mutationFn: ({ loanId }: { loanId: string }) => {
      return loanService.sendPaymentReminder(loanId);
    },
    onSuccess: () => {
      toast({
        title: "Rappel envoyé",
        description: "Le rappel de paiement a été envoyé au client",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Une erreur est survenue lors de l'envoi du rappel",
        variant: "destructive",
      });
    }
  });

  // Get loan details with cached results
  const getLoanById = async (loanId: string) => {
    const cachedLoan = queryClient.getQueryData<Loan>(['loan', loanId]);
    if (cachedLoan) return cachedLoan;
    
    const loan = await loanService.getLoanById(loanId);
    if (loan) {
      queryClient.setQueryData(['loan', loanId], loan);
    }
    return loan;
  };

  // Force refresh loans
  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['loans'] });
    refetch();
  };

  return {
    loans,
    isLoading,
    isError,
    createLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    recordPayment,
    sendPaymentReminder,
    getLoanById,
    refetch,
    forceRefresh
  };
}
