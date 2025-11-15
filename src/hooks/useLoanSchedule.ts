import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoanScheduleItem {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  remaining_principal: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paid_amount: number;
  paid_at: string | null;
  late_fee: number;
  days_overdue: number;
  created_at: string;
  updated_at: string;
}

export interface LoanScheduleData {
  schedule: LoanScheduleItem[];
  isLoading: boolean;
  error: Error | null;
  totalInstallments: number;
  paidInstallments: number;
  overdueInstallments: number;
  partiallyPaidInstallments: number;
  pendingInstallments: number;
  nextDue: LoanScheduleItem | undefined;
  progressPercentage: number;
  totalPaid: number;
  totalRemaining: number;
  totalLateFees: number;
  refetch: () => void;
}

/**
 * Hook personnalisé pour récupérer et gérer l'échéancier d'un prêt
 */
export function useLoanSchedule(loanId: string): LoanScheduleData {
  const { data: schedule, isLoading, error, refetch } = useQuery({
    queryKey: ['loan-schedule', loanId],
    queryFn: async () => {
      if (!loanId) return [];
      
      const { data, error } = await supabase
        .from('loan_payment_schedules')
        .select('*')
        .eq('loan_id', loanId)
        .order('installment_number', { ascending: true });

      if (error) {
        console.error('Error fetching loan schedule:', error);
        throw error;
      }

      return data as LoanScheduleItem[];
    },
    enabled: !!loanId,
    staleTime: 30 * 1000, // 30 secondes
  });

  // Calculs dérivés
  const totalInstallments = schedule?.length || 0;
  const paidInstallments = schedule?.filter(s => s.status === 'paid').length || 0;
  const overdueInstallments = schedule?.filter(s => s.status === 'overdue').length || 0;
  const partiallyPaidInstallments = schedule?.filter(s => s.status === 'partially_paid').length || 0;
  const pendingInstallments = schedule?.filter(s => s.status === 'pending').length || 0;
  
  const nextDue = schedule?.find(s => s.status === 'pending' || s.status === 'partially_paid');
  
  const progressPercentage = totalInstallments > 0 
    ? Math.round((paidInstallments / totalInstallments) * 100) 
    : 0;

  const totalPaid = schedule?.reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const totalRemaining = schedule?.reduce((sum, s) => {
    if (s.status !== 'paid') {
      return sum + (s.total_amount - s.paid_amount + s.late_fee);
    }
    return sum;
  }, 0) || 0;

  const totalLateFees = schedule?.reduce((sum, s) => sum + s.late_fee, 0) || 0;

  return {
    schedule: schedule || [],
    isLoading,
    error: error as Error | null,
    totalInstallments,
    paidInstallments,
    overdueInstallments,
    partiallyPaidInstallments,
    pendingInstallments,
    nextDue,
    progressPercentage,
    totalPaid,
    totalRemaining,
    totalLateFees,
    refetch,
  };
}
