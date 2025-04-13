import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LoanApplication {
  sfd_id: string;
  amount: number;
  duration_months: number;
  purpose: string;
  supporting_documents?: string[];
  interest_rate?: number;
}

export function useClientLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch client loans
  const loansQuery = useQuery({
    queryKey: ['client-loans', user?.id],
    queryFn: async (): Promise<Loan[]> => {
      if (!user?.id) return [];
      
      // First, get the client profile
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id, sfd_id')
        .eq('user_id', user.id);
        
      if (clientError || !clientData.length) {
        console.error('Error fetching client data:', clientError);
        return [];
      }
      
      // Fetch loans for the client
      const clientId = clientData[0].id;
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching loans:', error);
        return [];
      }
      
      return data as Loan[];
    },
    enabled: !!user?.id
  });
  
  // Apply for a loan
  const applyForLoan = useMutation({
    mutationFn: async (application: LoanApplication) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      
      setIsUploading(true);
      
      try {
        // Get client ID
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id')
          .eq('user_id', user.id)
          .eq('sfd_id', application.sfd_id)
          .single();
          
        if (clientError || !clientData) {
          throw new Error("Client non trouvé pour cette SFD");
        }
        
        // Verify SFD is active
        const { data: sfdData, error: sfdError } = await supabase
          .from('sfds')
          .select('status')
          .eq('id', application.sfd_id)
          .single();
          
        if (sfdError || !sfdData) {
          throw new Error("SFD non trouvée");
        }
        
        if (sfdData.status !== 'active') {
          throw new Error("Cette SFD n'est pas active actuellement");
        }
        
        // Calculate monthly payment (simplified formula)
        const interestRate = application.interest_rate || 0.055; // 5.5% annual rate
        const monthlyRate = interestRate / 12;
        const monthlyPayment = (application.amount * monthlyRate * Math.pow(1 + monthlyRate, application.duration_months)) / 
                               (Math.pow(1 + monthlyRate, application.duration_months) - 1);
                               
        // Create the loan application
        const { data: loanData, error: loanError } = await supabase
          .from('sfd_loans')
          .insert({
            client_id: clientData.id,
            sfd_id: application.sfd_id,
            amount: application.amount,
            duration_months: application.duration_months,
            interest_rate: interestRate,
            purpose: application.purpose,
            monthly_payment: Math.round(monthlyPayment * 100) / 100,
            status: 'pending'
          })
          .select()
          .single();
          
        if (loanError) throw loanError;
        
        // If there are supporting documents, add them to the loan
        if (application.supporting_documents && application.supporting_documents.length > 0) {
          const documentPromises = application.supporting_documents.map(docUrl => {
            return supabase
              .from('client_documents')
              .insert({
                client_id: clientData.id,
                document_type: 'loan_supporting',
                document_url: docUrl
              });
          });
          
          await Promise.all(documentPromises);
        }
        
        // Create a notification for SFD admin
        await supabase
          .from('admin_notifications')
          .insert({
            title: 'Nouvelle demande de prêt',
            message: `Une nouvelle demande de prêt de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(application.amount)} a été soumise.`,
            recipient_role: 'sfd_admin',
            sender_id: user.id,
            type: 'loan_application',
            read: false,
            action_link: `/loans/${loanData.id}`
          });
          
        return loanData as Loan;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.",
      });
      queryClient.invalidateQueries({ queryKey: ['client-loans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    }
  });
  
  // Upload document for loan application
  const uploadDocument = async (file: File): Promise<string | null> => {
    if (!user?.id || !file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `loan-documents/${fileName}`;
    
    try {
      const { error } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('client-documents')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  };
  
  // Get loan notification status
  const getNotifications = useQuery({
    queryKey: ['loan-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .like('type', 'loan_%')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching loan notifications:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id
  });
  
  // Mark notification as read
  const markNotificationAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-notifications'] });
    }
  });
  
  return {
    loans: loansQuery.data || [],
    isLoading: loansQuery.isLoading,
    isUploading,
    applyForLoan,
    uploadDocument,
    notifications: getNotifications.data || [],
    notificationsLoading: getNotifications.isLoading,
    markNotificationAsRead,
    refetchLoans: loansQuery.refetch,
    refetchNotifications: getNotifications.refetch
  };
}
