
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoanApplication } from './useLoanApplication';

export interface Loan {
  id: string;
  amount: number;
  client_id: string;
  created_at: string;
  disbursed_at: string | null;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  purpose: string;
  sfd_id: string;
  sfd_name?: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'disbursed';
  subsidy_amount?: number;
}

interface LoanNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  action_link?: string;
}

export function useClientLoans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch all loans for the client
  const { data: loans = [], isLoading, error, refetch } = useQuery({
    queryKey: ['client-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // First try to get clients for this user
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id')
          .eq('user_id', user.id);
          
        if (clientsError) throw clientsError;
        
        if (!clientsData || clientsData.length === 0) {
          return [];
        }
        
        // Now get loans for each client
        const clientIds = clientsData.map(client => client.id);
        
        const { data: loansData, error: loansError } = await supabase
          .from('sfd_loans')
          .select(`
            *,
            sfds:sfd_id (name)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });
          
        if (loansError) throw loansError;
        
        // Format the data to match our interface
        return loansData.map(loan => ({
          ...loan,
          sfd_name: loan.sfds?.name
        })) as Loan[];
      } catch (error) {
        console.error("Error fetching client loans:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
  
  // Apply for a loan
  const applyForLoan = useMutation({
    mutationFn: async (application: LoanApplication) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // This will use our useLoanApplication hook
      const { submitApplication } = require('./useLoanApplication').useLoanApplication();
      return await submitApplication.mutateAsync(application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-loans'] });
    }
  });

  // Mock notifications data - in a real app, this would come from the database
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['client-notifications', user?.id],
    queryFn: async () => {
      // In a real implementation, this would fetch notifications from Supabase
      // For now, we'll return mock data based on the loans
      if (!loans || !Array.isArray(loans) || loans.length === 0) return [];

      return loans.map(loan => ({
        id: `notification-${loan.id}`,
        title: `Prêt ${loan.status === 'approved' ? 'approuvé' : loan.status === 'rejected' ? 'rejeté' : 'mis à jour'}`,
        message: `Votre demande de prêt de ${loan.amount} FCFA a été ${loan.status === 'approved' ? 'approuvée' : loan.status === 'rejected' ? 'rejetée' : 'mise à jour'}.`,
        created_at: loan.created_at,
        read: false,
        type: `loan_${loan.status}`,
        action_link: `/mobile-flow/loan-details/${loan.id}`
      })) as LoanNotification[];
    },
    enabled: !!user?.id && Array.isArray(loans) && loans.length > 0,
  });
  
  // Mark notification as read
  const markNotificationAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // In a real implementation, update the notification in the database
      console.log(`Marking notification ${notificationId} as read`);
      return notificationId;
    }
  });

  const refetchLoans = () => refetch();
  const refetchNotifications = () => queryClient.invalidateQueries({ queryKey: ['client-notifications'] });

  const isUploading = false; // This would be set true when files are being uploaded
  
  return {
    loans,
    isLoading,
    error,
    refetch: refetchLoans,
    applyForLoan,
    notifications,
    notificationsLoading,
    markNotificationAsRead,
    refetchNotifications,
    isUploading
  };
}
