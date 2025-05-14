
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { Loan } from '@/types/sfdClients';

export function useSfdLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sfd-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) return []; // Return empty array if no user

      try {
        console.log("Fetching SFD loans for user:", user.id);
        const sfdId = user?.sfd_id || user?.app_metadata?.sfd_id;
        
        if (!sfdId) {
          console.warn("No SFD ID found for user");
          return [];
        }
        
        console.log("Using SFD ID:", sfdId);
        
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
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });

        if (loansError) {
          console.error('Failed to fetch loans:', loansError);
          return [];
        }
        
        console.log(`Found ${loans?.length || 0} loans for SFD ${sfdId}`);
        
        // Format loans with client names
        return (loans || []).map(loan => ({
          ...loan,
          client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
        }));
      } catch (err) {
        console.error('Error in useSfdLoans hook:', err);
        return [];
      }
    },
    meta: {
      errorMessage: "Impossible de charger vos prêts"
    },
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
    data: query.data || [], 
    loans: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    recordPayment
  };
}
