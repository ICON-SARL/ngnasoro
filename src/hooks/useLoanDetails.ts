
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export interface LoanStatus {
  nextPaymentDue: string;
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  progress: number;
  lateFees: number;
  paymentHistory: Array<{
    id: number;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'late';
  }>;
  disbursed: boolean;
  withdrawn: boolean;
}

export interface LoanDetails {
  loanType: string;
  loanPurpose: string;
  disbursalDate: string;
  endDate: string;
  interestRate: number;
  status: string;
  disbursed: boolean;
  withdrawn: boolean;
}

export function useLoanDetails(loanId: string | undefined) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loanStatus, setLoanStatus] = useState<LoanStatus>({
    nextPaymentDue: '10 Juillet 2023',
    paidAmount: 10.40,
    totalAmount: 25.40,
    remainingAmount: 15.00,
    progress: 40,
    lateFees: 0,
    paymentHistory: [
      { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
      { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
      { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
    ],
    disbursed: true,
    withdrawn: false
  });
  
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loanType: "Microcrédit",
    loanPurpose: "Achat de matériel",
    disbursalDate: "5 janvier 2023",
    endDate: "5 juillet 2023",
    interestRate: 2.5,
    status: "actif",
    disbursed: true,
    withdrawn: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  const fetchLoanDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!loanId) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          id, 
          amount, 
          interest_rate, 
          duration_months, 
          monthly_payment,
          purpose,
          disbursed_at,
          status,
          next_payment_date,
          last_payment_date,
          sfd_id,
          client_id
        `)
        .eq('id', loanId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Store previous status for change detection
        if (previousStatus !== null && previousStatus !== data.status) {
          // Log status change
          if (user?.id) {
            logAuditEvent({
              user_id: user.id,
              action: 'loan_status_changed',
              category: AuditLogCategory.LOAN_OPERATIONS,
              severity: AuditLogSeverity.WARNING,
              details: {
                loan_id: loanId,
                old_status: previousStatus,
                new_status: data.status
              },
              status: 'success',
              target_resource: `loan:${loanId}`
            });
          }
        }
        
        setPreviousStatus(data.status);
        
        setLoanDetails({
          loanType: data.purpose.includes('Micro') ? 'Microcrédit' : 'Prêt standard',
          loanPurpose: data.purpose,
          disbursalDate: new Date(data.disbursed_at || Date.now()).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          endDate: new Date(new Date(data.disbursed_at || Date.now()).setMonth(
            new Date(data.disbursed_at || Date.now()).getMonth() + data.duration_months
          )).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          interestRate: data.interest_rate,
          status: data.status,
          disbursed: !!data.disbursed_at,
          withdrawn: data.status === 'withdrawn'
        });
        
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('loan_payments')
          .select('*')
          .eq('loan_id', loanId)
          .order('payment_date', { ascending: false });
          
        if (paymentsError) throw paymentsError;
        
        const paidAmount = paymentsData?.reduce((total, payment) => total + payment.amount, 0) || 0;
        const totalAmount = data.amount + (data.amount * data.interest_rate / 100);
        const remainingAmount = totalAmount - paidAmount;
        const progress = Math.min(100, Math.round((paidAmount / totalAmount) * 100));
        
        const now = new Date();
        const nextPaymentDate = data.next_payment_date ? new Date(data.next_payment_date) : null;
        const lateFees = (nextPaymentDate && nextPaymentDate < now) ? data.monthly_payment * 0.05 : 0;
        
        const paymentHistory = paymentsData?.map((payment, index) => {
          let status: 'paid' | 'pending' | 'late';
          if (payment.status === 'completed') status = 'paid';
          else if (payment.status === 'late') status = 'late';
          else status = 'pending';
          
          return {
            id: index + 1,
            date: new Date(payment.payment_date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }),
            amount: payment.amount,
            status
          };
        }) || [];
        
        setLoanStatus({
          nextPaymentDue: nextPaymentDate ? nextPaymentDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }) : 'Non défini',
          paidAmount,
          totalAmount,
          remainingAmount,
          progress,
          lateFees,
          paymentHistory,
          disbursed: !!data.disbursed_at,
          withdrawn: data.status === 'withdrawn'
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des détails du prêt:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails du prêt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanDetails();
    
    const setupRealtimeSubscription = async () => {
      const channel = supabase
        .channel('loan-status-changes')
        .on(
          'broadcast',
          { event: 'loan_status_update' },
          (payload) => {
            if (payload.payload) {
              const updatedStatus = payload.payload;
              setLoanStatus(prevStatus => ({
                ...prevStatus,
                ...updatedStatus
              }));
              
              if (updatedStatus.lateFees > 0) {
                toast({
                  title: "Frais de retard appliqués",
                  description: `Des frais de retard de ${updatedStatus.lateFees} FCFA ont été appliqués à votre prêt`,
                  variant: "destructive",
                });
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    setupRealtimeSubscription();
  }, [loanId, toast]);

  return {
    loanStatus,
    loanDetails,
    isLoading,
    error,
    refetch: fetchLoanDetails
  };
}
