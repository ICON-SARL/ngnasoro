
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerefSfdLoan {
  id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  monthly_payment: number;
  total_amount: number;
  remaining_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  justification?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  disbursed_at?: string;
  next_payment_date?: string;
  last_payment_date?: string;
  payments_made: number;
  reference: string;
  created_at: string;
  updated_at: string;
  sfds?: {
    name: string;
    code: string;
    logo_url?: string;
  };
}

export interface MerefSfdLoanPayment {
  id: string;
  meref_loan_id: string;
  sfd_id: string;
  amount: number;
  principal_amount?: number;
  interest_amount?: number;
  payment_method: string;
  reference?: string;
  notes?: string;
  status: string;
  recorded_by?: string;
  created_at: string;
}

export interface LoanTraceability {
  meref_loan_id: string;
  meref_reference: string;
  meref_amount: number;
  meref_remaining: number;
  meref_status: string;
  meref_created_at: string;
  sfd_id: string;
  sfd_name: string;
  sfd_code: string;
  client_loan_id?: string;
  client_loan_amount?: number;
  client_remaining?: number;
  client_loan_status?: string;
  client_id?: string;
  client_name?: string;
  client_phone?: string;
}

export function useMerefSfdLoans(sfdId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all MEREF SFD loans (for MEREF admin)
  const { data: loans, isLoading, error, refetch } = useQuery({
    queryKey: ['meref-sfd-loans', sfdId],
    queryFn: async () => {
      let query = supabase
        .from('meref_sfd_loans')
        .select(`
          *,
          sfds:sfd_id (
            name,
            code,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MerefSfdLoan[];
    }
  });

  // Fetch loan payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['meref-sfd-loan-payments', sfdId],
    queryFn: async () => {
      let query = supabase
        .from('meref_sfd_loan_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MerefSfdLoanPayment[];
    }
  });

  // Fetch traceability data
  const { data: traceability, isLoading: traceabilityLoading } = useQuery({
    queryKey: ['meref-loan-traceability', sfdId],
    queryFn: async () => {
      let query = supabase
        .from('meref_loan_traceability')
        .select('*');

      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LoanTraceability[];
    }
  });

  // Create loan request mutation
  const createLoanRequest = useMutation({
    mutationFn: async (loanData: {
      sfd_id: string;
      amount: number;
      interest_rate?: number;
      duration_months: number;
      purpose: string;
      justification?: string;
    }) => {
      const { data, error } = await supabase
        .from('meref_sfd_loans')
        .insert(loanData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Demande créée',
        description: 'Votre demande de prêt MEREF a été soumise avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-sfd-loans'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Approve loan mutation
  const approveLoan = useMutation({
    mutationFn: async ({ loanId, approvedBy }: { loanId: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from('meref_sfd_loans')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Prêt approuvé',
        description: 'Le prêt a été approuvé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-sfd-loans'] });
    }
  });

  // Reject loan mutation
  const rejectLoan = useMutation({
    mutationFn: async ({ loanId, reason }: { loanId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('meref_sfd_loans')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Prêt rejeté',
        description: 'Le prêt a été rejeté',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-sfd-loans'] });
    }
  });

  // Disburse loan mutation
  const disburseLoan = useMutation({
    mutationFn: async (loanId: string) => {
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { data, error } = await supabase
        .from('meref_sfd_loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          next_payment_date: nextPaymentDate.toISOString().split('T')[0]
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Prêt décaissé',
        description: 'Les fonds ont été décaissés vers la SFD',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-sfd-loans'] });
    }
  });

  // Record payment mutation with validation
  const recordPayment = useMutation({
    mutationFn: async (paymentData: {
      meref_loan_id: string;
      sfd_id: string;
      amount: number;
      payment_method: string;
      reference?: string;
      notes?: string;
      recorded_by?: string;
    }) => {
      // 1. Fetch current loan to validate payment amount
      const { data: loan, error: loanError } = await supabase
        .from('meref_sfd_loans')
        .select('remaining_amount, status')
        .eq('id', paymentData.meref_loan_id)
        .single();

      if (loanError) throw new Error('Impossible de vérifier le prêt');
      
      if (!loan) throw new Error('Prêt introuvable');
      
      if (loan.status === 'completed') {
        throw new Error('Ce prêt est déjà entièrement remboursé');
      }
      
      if (paymentData.amount > (loan.remaining_amount || 0)) {
        throw new Error(`Le montant dépasse le reste dû (${(loan.remaining_amount || 0).toLocaleString()} FCFA)`);
      }
      
      if (paymentData.amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }

      // 2. Insert payment (trigger will update remaining_amount)
      const { data, error } = await supabase
        .from('meref_sfd_loan_payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Paiement enregistré',
        description: 'Le remboursement a été enregistré avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-sfd-loans'] });
      queryClient.invalidateQueries({ queryKey: ['meref-sfd-loan-payments'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de paiement',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Calculate statistics
  const stats = loans ? {
    totalLoans: loans.length,
    totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
    totalOutstanding: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
    pendingRequests: loans.filter(l => l.status === 'pending').length,
    activeLoans: loans.filter(l => l.status === 'active').length,
    completedLoans: loans.filter(l => l.status === 'completed').length,
    defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
    recoveryRate: loans.filter(l => l.status === 'active' || l.status === 'completed').length > 0
      ? (loans.filter(l => l.status === 'completed').reduce((sum, l) => sum + (l.total_amount || 0), 0) /
         loans.filter(l => l.status === 'active' || l.status === 'completed').reduce((sum, l) => sum + (l.total_amount || 0), 0)) * 100
      : 0
  } : null;

  return {
    loans,
    payments,
    traceability,
    stats,
    isLoading,
    paymentsLoading,
    traceabilityLoading,
    error,
    refetch,
    createLoanRequest,
    approveLoan,
    rejectLoan,
    disburseLoan,
    recordPayment
  };
}
