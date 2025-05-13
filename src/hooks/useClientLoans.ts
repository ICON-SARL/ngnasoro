
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoanApplication } from './useLoanApplication';
import { useToast } from '@/hooks/use-toast';

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
  next_payment_date?: string;
  sfds?: {
    name: string;
    logo_url: string;
  };
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
  const { toast } = useToast();
  
  // Fetch all loans for the client
  const { data: loans = [], isLoading, error, refetch } = useQuery({
    queryKey: ['client-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        console.log("Fetching client loans for user:", user.id);
        
        // First try to get clients for this user
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id')
          .eq('user_id', user.id);
          
        if (clientsError) {
          console.error("Error fetching client data:", clientsError);
          return [];
        }
        
        if (!clientsData || clientsData.length === 0) {
          console.log("No client records found for user - checking direct loan data");
          
          // As a fallback, try querying loans directly using user's ID in client_id
          const { data: directLoans, error: directError } = await supabase
            .from('sfd_loans')
            .select(`
              *,
              sfds:sfd_id (name, logo_url)
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });
            
          if (directError) {
            console.error("Direct loans query error:", directError);
          } else if (directLoans && directLoans.length > 0) {
            console.log("Found loans directly by user ID:", directLoans.length);
            return directLoans.map(loan => ({
              ...loan,
              sfd_name: loan.sfds?.name || 'SFD'
            })) as Loan[];
          }
          
          return [];
        }
        
        // Now get loans for each client
        const clientIds = clientsData.map(client => client.id);
        console.log("Found client IDs:", clientIds);
        
        const { data: loansData, error: loansError } = await supabase
          .from('sfd_loans')
          .select(`
            *,
            sfds:sfd_id (name, logo_url)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });
          
        if (loansError) {
          console.error("Error fetching loans:", loansError);
          return [];
        }
        
        console.log("Loans fetched successfully:", loansData?.length || 0, "loans");
        
        // Format the data to match our interface
        return (loansData || []).map(loan => ({
          ...loan,
          sfd_name: loan.sfds?.name || 'SFD'
        })) as Loan[];
      } catch (error) {
        console.error("Error in useClientLoans hook:", error);
        return [];
      }
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
  
  // Apply for a loan
  const applyForLoan = useMutation({
    mutationFn: async (application: LoanApplication) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Use the loan-manager edge function
      const { data, error } = await supabase.functions.invoke('loan-manager', {
        body: {
          action: 'create_loan',
          data: application
        }
      });
      
      if (error) {
        console.error("Error in loan application:", error);
        throw new Error(error.message || "Failed to create loan application");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-loans'] });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive"
      });
    }
  });

  // Generate notifications based on loans
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['client-notifications', user?.id],
    queryFn: async () => {
      // First try to get actual notifications from the database
      const { data: actualNotifications, error: notifError } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (!notifError && actualNotifications && actualNotifications.length > 0) {
        return actualNotifications;
      }
    
      // If no real notifications exist, generate mock ones based on loans
      if (!loans || !Array.isArray(loans) || loans.length === 0) return [];

      return loans.map(loan => ({
        id: `notification-${loan.id}`,
        title: `Prêt ${loan.status === 'approved' ? 'approuvé' : loan.status === 'rejected' ? 'rejeté' : 'mis à jour'}`,
        message: `Votre demande de prêt de ${loan.amount?.toLocaleString('fr-FR') || 0} FCFA a été ${loan.status === 'approved' ? 'approuvée' : loan.status === 'rejected' ? 'rejetée' : 'mise à jour'}.`,
        created_at: loan.created_at,
        read: false,
        type: `loan_${loan.status}`,
        action_link: `/mobile-flow/loan-details/${loan.id}`
      })) as LoanNotification[];
    },
    enabled: !!user?.id && Array.isArray(loans),
  });
  
  // Mark notification as read
  const markNotificationAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
    }
  });

  return {
    loans: loans || [],
    isLoading,
    error,
    refetch,
    applyForLoan,
    notifications: notifications || [],
    notificationsLoading,
    markNotificationAsRead,
    refetchNotifications: () => queryClient.invalidateQueries({ queryKey: ['client-notifications'] }),
    isUploading: false
  };
}
