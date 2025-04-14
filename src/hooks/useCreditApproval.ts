
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface CreditApplication {
  id: string;
  reference: string;
  sfd_id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  score: number;
  approval_comments?: string;
  rejection_reason?: string;
  rejection_comments?: string;
}

export function useCreditApproval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAdmin, isSfdAdmin } = useAuth();

  // Fetch credit applications using the Edge Function
  const fetchCreditApplications = async (): Promise<CreditApplication[]> => {
    try {
      setIsLoading(true);
      
      // Use the credit-manager edge function to get applications
      const sfdId = user?.user_metadata?.sfd_id;
      const payload = { sfdId, filters: {} };
      
      console.log('Fetching credit applications with payload:', payload);
      console.log('Current user role:', isAdmin ? 'Admin' : isSfdAdmin ? 'SFD Admin' : 'Other');
      
      const { data: responseData, error } = await supabase.functions.invoke('credit-manager', {
        body: { action: 'get_applications', payload }
      });
      
      if (error) {
        console.error('Error fetching credit applications:', error);
        return [];
      }
      
      console.log('Credit applications response:', responseData);
      return responseData?.data || [];
    } catch (error) {
      console.error('Error in fetchCreditApplications:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Use React Query to manage the data fetching
  const { data: applications = [], refetch } = useQuery({
    queryKey: ['credit-applications'],
    queryFn: fetchCreditApplications
  });

  // Create a new credit application (for SFD admins)
  const createCreditApplication = useMutation({
    mutationFn: async ({ 
      amount, 
      purpose
    }: { 
      amount: number; 
      purpose: string;
    }) => {
      if (!user?.user_metadata?.sfd_id && !isSfdAdmin) {
        throw new Error("Vous devez être connecté en tant qu'admin SFD pour créer une demande de crédit");
      }
      
      const sfdId = user.user_metadata.sfd_id;
      
      console.log('Creating credit application:', { sfdId, amount, purpose });
      
      // Use the credit-manager edge function to create a new application
      const { data, error } = await supabase.functions.invoke('credit-manager', {
        body: { 
          action: 'create_application', 
          payload: { 
            sfdId, 
            amount, 
            purpose 
          } 
        }
      });
      
      if (error) throw error;
      
      console.log('Credit application created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      toast({
        title: 'Demande créée',
        description: 'Votre demande de crédit a été soumise avec succès',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la création de la demande",
        variant: 'destructive',
      });
    }
  });

  // Approve credit application
  const approveCredit = useMutation({
    mutationFn: async ({ 
      applicationId, 
      comments 
    }: { 
      applicationId: string; 
      comments?: string; 
    }) => {
      if (!isAdmin) {
        throw new Error("Vous n'avez pas les permissions pour approuver cette demande");
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .insert({
            user_id: user?.id,
            action: 'approve_credit_application',
            category: 'credit_management',
            status: 'success',
            target_resource: `credit_applications/${applicationId}`,
            details: {
              comments
            },
            severity: 'info'
          });
          
        if (error) throw error;
        
        console.log('Approving credit application:', { applicationId, comments });
        
        // Use edge function to update application status
        const { data: updatedApp, error: updateError } = await supabase.functions.invoke('credit-manager', {
          body: { 
            action: 'approve_application', 
            payload: { applicationId, comments } 
          }
        });
        
        if (updateError) throw updateError;
        
        console.log('Credit application approved:', updatedApp);
        return updatedApp;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      toast({
        title: 'Crédit approuvé',
        description: 'La demande de crédit a été approuvée avec succès',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de l'approbation",
        variant: 'destructive',
      });
    }
  });

  // Reject credit application
  const rejectCredit = useMutation({
    mutationFn: async ({ 
      applicationId, 
      reason, 
      comments 
    }: { 
      applicationId: string; 
      reason: string;
      comments?: string; 
    }) => {
      if (!isAdmin) {
        throw new Error("Vous n'avez pas les permissions pour rejeter cette demande");
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .insert({
            user_id: user?.id,
            action: 'reject_credit_application',
            category: 'credit_management',
            status: 'success',
            target_resource: `credit_applications/${applicationId}`,
            details: {
              reason,
              comments
            },
            severity: 'warning'
          });
          
        if (error) throw error;
        
        console.log('Rejecting credit application:', { applicationId, reason, comments });
        
        // Use edge function to update application status
        const { data: updatedApp, error: updateError } = await supabase.functions.invoke('credit-manager', {
          body: { 
            action: 'reject_application', 
            payload: { applicationId, reason, comments } 
          }
        });
        
        if (updateError) throw updateError;
        
        console.log('Credit application rejected:', updatedApp);
        return updatedApp;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      toast({
        title: 'Crédit rejeté',
        description: 'La demande de crédit a été rejetée',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors du rejet",
        variant: 'destructive',
      });
    }
  });

  return {
    applications,
    isLoading,
    refetch,
    createCreditApplication,
    approveCredit,
    rejectCredit
  };
}
