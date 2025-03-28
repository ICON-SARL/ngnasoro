
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { Loan } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSfdLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all loans for the current SFD
  const loansQuery = useQuery({
    queryKey: ['sfd-loans'],
    queryFn: sfdLoanApi.getSfdLoans,
    enabled: !!user
  });
  
  // Create a new loan
  const createLoan = useMutation({
    mutationFn: sfdLoanApi.createLoan,
    onSuccess: () => {
      toast({
        title: "Prêt créé avec succès",
        description: "Le prêt a été créé et est en attente d'approbation",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
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
      return sfdLoanApi.approveLoan(loanId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Prêt approuvé",
        description: "Le prêt a été approuvé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
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
      return sfdLoanApi.rejectLoan(loanId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Prêt rejeté",
        description: "Le prêt a été rejeté",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
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
      return sfdLoanApi.disburseLoan(loanId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Prêt décaissé",
        description: "Le prêt a été décaissé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
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
      return sfdLoanApi.recordLoanPayment(loanId, amount, paymentMethod, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
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
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      // Fix: Remove the second argument (user.id) since the loanNotificationService only expects one argument
      return sfdLoanApi.sendPaymentReminder(loanId);
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

  // Confirm loan agreement (OTP confirmation)
  const confirmLoanAgreement = useMutation({
    mutationFn: ({ loanId, otpCode }: { loanId: string, otpCode: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      // In a real implementation, this would verify the OTP before confirming
      console.log(`Confirming loan ${loanId} with OTP code ${otpCode}`);
      // For demo, we'll just approve the loan directly
      return sfdLoanApi.approveLoan(loanId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Prêt confirmé",
        description: "Votre accord de prêt a été confirmé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de confirmation",
        description: error.message || "Une erreur est survenue lors de la confirmation",
        variant: "destructive",
      });
    }
  });

  // Get loan details
  const getLoanById = async (loanId: string) => {
    return sfdLoanApi.getLoanById(loanId);
  };

  // Get loan payments
  const getLoanPayments = async (loanId: string) => {
    return sfdLoanApi.getLoanPayments(loanId);
  };

  return {
    loans: loansQuery.data || [],
    isLoading: loansQuery.isLoading,
    isError: loansQuery.isError,
    createLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    recordPayment,
    sendPaymentReminder,
    confirmLoanAgreement,
    getLoanById,
    getLoanPayments,
    refetch: loansQuery.refetch
  };
}
