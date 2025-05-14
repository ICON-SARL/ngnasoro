import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sfdLoanApi } from '@/utils/sfdLoanApi';

export function useSfdLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sfd-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) return []; // Return empty array if no user

      try {
        // First, get all client IDs for this user
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', user.id);

        if (clientsError) {
          console.error('Failed to fetch client data:', clientsError);
          return []; // Return empty array instead of throwing an error
        }

        if (!clientsData?.length) {
          console.log('No client records found for user');
          return []; // Return empty array
        }

        const clientIds = clientsData.map(client => client.id);

        // Get loans for these clients
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
          console.error('Failed to fetch loans:', loansError);
          return []; // Return empty array instead of throwing an error
        }

        return loans || [];
      } catch (err) {
        console.error('Error in useSfdLoans hook:', err);
        return []; // Return empty array on any error
      }
    },
    meta: {
      errorMessage: "Impossible de charger vos prêts"
    },
    // Don't show error toasts for this query
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Create loan mutation
  const createLoan = useMutation({
    mutationFn: sfdLoanApi.createLoan,
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
    mutationFn: (loanId: string) => sfdLoanApi.approveLoan(loanId),
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
    mutationFn: (loanId: string) => sfdLoanApi.rejectLoan(loanId),
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
    mutationFn: (loanId: string) => sfdLoanApi.disburseLoan(loanId),
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
      sfdLoanApi.recordLoanPayment(loanId, amount, paymentMethod),
    onSuccess: () => {
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
    }
  });

  return {
    data: query.data || [], // Ensure we always return an array
    loans: query.data || [], // Add this for backward compatibility
    isLoading: query.isLoading,
    error: query.error,
    createLoan,
    approveLoan: useMutation({
      mutationFn: (loanId: string) => sfdLoanApi.approveLoan(loanId),
      onSuccess: () => {
        toast({
          title: "Prêt approuvé",
          description: "Le prêt a été approuvé avec succès",
        });
        queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
      }
    }),
    rejectLoan: useMutation({
      mutationFn: (loanId: string) => sfdLoanApi.rejectLoan(loanId),
      onSuccess: () => {
        toast({
          title: "Prêt rejeté",
          description: "Le prêt a été rejeté",
        });
        queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
      }
    }),
    disburseLoan: useMutation({
      mutationFn: (loanId: string) => sfdLoanApi.disburseLoan(loanId),
      onSuccess: () => {
        toast({
          title: "Prêt décaissé",
          description: "Le prêt a été décaissé avec succès",
        });
        queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
      }
    }),
    recordPayment: useMutation({
      mutationFn: ({ loanId, amount, paymentMethod }: { loanId: string, amount: number, paymentMethod: string }) => 
        sfdLoanApi.recordLoanPayment(loanId, amount, paymentMethod),
      onSuccess: () => {
        toast({
          title: "Paiement enregistré",
          description: "Le paiement a été enregistré avec succès",
        });
        queryClient.invalidateQueries({ queryKey: ['sfd-loans'] });
      }
    })
  };
}
