
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { Loan } from '@/types/sfdClients';

/**
 * Hook for SFD Admins - fetches all loans in their SFD
 */
export function useSfdAdminLoans() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all loans for the active SFD
  const query = useQuery({
    queryKey: ['sfd-loans', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) {
        console.warn("No active SFD ID found, cannot fetch loans");
        return [];
      }
      
      try {
        console.log("Fetching SFD loans for SFD ID:", activeSfdId);
        
        // Fetch all loans for this SFD directly
        const { data: loans, error: loansError } = await supabase
          .from('sfd_loans')
          .select(`
            *,
            sfd_clients(full_name, email, phone),
            sfds:sfd_id (
              name,
              logo_url
            )
          `)
          .eq('sfd_id', activeSfdId)
          .order('created_at', { ascending: false });

        if (loansError) {
          console.error('Failed to fetch loans:', loansError);
          throw loansError;
        }
        
        console.log(`Found ${loans?.length || 0} loans for SFD ${activeSfdId}`);
        
        // Format loans with client names
        return (loans || []).map(loan => ({
          ...loan,
          client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
          reference: loan.id.substring(0, 8),
        })) as Loan[];
      } catch (err) {
        console.error('Error in useSfdLoans hook:', err);
        throw err;
      }
    },
    meta: {
      errorMessage: "Impossible de charger les prêts"
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime)
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
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'approbation du prêt",
        variant: "destructive", 
      });
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
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du rejet du prêt",
        variant: "destructive",
      });
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
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du décaissement du prêt", 
        variant: "destructive",
      });
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
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement du paiement",
        variant: "destructive",
      });
    }
  });

  // Manual refetch function
  const manualRefetch = async () => {
    console.log("Manually refetching SFD loans...");
    return query.refetch();
  };

  return {
    data: query.data || [], 
    loans: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: manualRefetch,
    createLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    recordPayment
  };
}
