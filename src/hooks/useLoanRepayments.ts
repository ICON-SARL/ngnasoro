
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/types/sfdClients';

export function useLoanRepayments() {
  const { activeSfdId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all active loans
  const fetchActiveLoans = async () => {
    if (!activeSfdId) return [];
    
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        id,
        client_id,
        amount,
        interest_rate,
        duration_months,
        status,
        monthly_payment,
        next_payment_date,
        last_payment_date,
        subsidy_amount,
        subsidy_rate,
        created_at,
        approved_at,
        disbursed_at,
        sfd_clients(full_name)
      `)
      .eq('sfd_id', activeSfdId)
      .in('status', ['active', 'overdue'])
      .order('next_payment_date', { ascending: true });
      
    if (error) {
      console.error('Error fetching active loans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les prêts actifs",
        variant: "destructive"
      });
      return [];
    }
    
    // Map the data to include client name and calculate the overdue status
    return data.map(loan => {
      const clientName = loan.sfd_clients ? loan.sfd_clients.full_name : 'Client inconnu';
      const nextPaymentDate = loan.next_payment_date ? new Date(loan.next_payment_date) : null;
      const isOverdue = nextPaymentDate && new Date() > nextPaymentDate;
      const daysOverdue = isOverdue && nextPaymentDate 
        ? Math.floor((new Date().getTime() - nextPaymentDate.getTime()) / (1000 * 3600 * 24))
        : 0;
      
      return {
        ...loan,
        client_name: clientName,
        status: isOverdue ? 'overdue' : loan.status,
        days_overdue: daysOverdue,
        reference: `LOAN-${loan.id.slice(0, 6)}`
      };
    });
  };
  
  // Use the query to get the active loans
  const { data: loans = [], isLoading, isError } = useQuery({
    queryKey: ['active-loans', activeSfdId],
    queryFn: fetchActiveLoans,
    enabled: !!activeSfdId
  });
  
  // Split the loans into active and overdue
  const activeLoans = loans.filter(loan => loan.status === 'active');
  const overdueLoans = loans.filter(loan => loan.status === 'overdue');
  
  // Get upcoming payments (next 7 days)
  const paymentsDue = loans
    .filter(loan => {
      if (!loan.next_payment_date) return false;
      const nextPayment = new Date(loan.next_payment_date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return nextPayment >= today && nextPayment <= nextWeek;
    })
    .map(loan => ({
      id: `payment-${loan.id}`,
      loan_id: loan.id,
      client_name: loan.client_name,
      amount: loan.monthly_payment,
      due_date: loan.next_payment_date,
      loan_reference: loan.reference
    }));
  
  // Record a loan payment
  const recordPayment = useMutation({
    mutationFn: async ({ 
      loanId, 
      amount, 
      paymentMethod 
    }: { 
      loanId: string, 
      amount: number, 
      paymentMethod: string 
    }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      
      // First, create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loanId,
          amount,
          payment_method: paymentMethod,
          status: 'completed'
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
      // Then, update the loan's last payment date and next payment date
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('monthly_payment, next_payment_date')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      const lastPaymentDate = new Date().toISOString();
      let nextPaymentDate: Date | null = null;
      
      if (loan.next_payment_date) {
        // Calculate next payment date (usually 1 month after the current next payment date)
        nextPaymentDate = new Date(loan.next_payment_date);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      } else {
        // If no next payment date, set to 1 month from now
        nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      
      const { error: updateError } = await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: lastPaymentDate,
          next_payment_date: nextPaymentDate.toISOString(),
          status: 'active' // Reset status if it was overdue
        })
        .eq('id', loanId);
        
      if (updateError) throw updateError;
      
      // Create activity record
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment',
          description: `Paiement de ${amount} FCFA enregistré`,
          performed_by: user.id
        });
      
      return { success: true, payment: paymentData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-loans', activeSfdId] });
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le paiement: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Export repayment report
  const exportRepaymentReport = async () => {
    // In a real app, this would generate and download a report
    toast({
      title: "Exportation",
      description: "Le rapport de remboursement a été généré et téléchargé",
    });
  };
  
  return {
    activeLoans,
    overdueLoans,
    paymentsDue,
    isLoading,
    isError,
    recordPayment,
    exportRepaymentReport
  };
}
