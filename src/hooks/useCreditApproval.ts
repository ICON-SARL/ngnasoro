
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

  // Fetch credit applications from Supabase
  const fetchCreditApplications = async (): Promise<CreditApplication[]> => {
    try {
      setIsLoading(true);
      
      // Différentes requêtes basées sur le rôle d'utilisateur
      let query = supabase.from('credit_applications').select(`
        id,
        reference,
        sfd_id,
        sfds:sfd_id (name),
        amount,
        purpose,
        status,
        created_at,
        score,
        approval_comments,
        rejection_reason,
        rejection_comments
      `);
      
      // Si c'est un admin SFD, filtre par son SFD
      if (isSfdAdmin && !isAdmin && user?.user_metadata?.sfd_id) {
        query = query.eq('sfd_id', user.user_metadata.sfd_id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Formater les données
      return (data || []).map(item => ({
        id: item.id,
        reference: item.reference,
        sfd_id: item.sfd_id,
        sfd_name: item.sfds?.name || 'SFD inconnu',
        amount: item.amount,
        purpose: item.purpose,
        status: item.status,
        created_at: item.created_at,
        score: item.score,
        approval_comments: item.approval_comments,
        rejection_reason: item.rejection_reason,
        rejection_comments: item.rejection_comments
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de crédit:', error);
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
      purpose,
      score 
    }: { 
      amount: number; 
      purpose: string;
      score?: number; 
    }) => {
      if (!user?.user_metadata?.sfd_id && !isSfdAdmin) {
        throw new Error("Vous devez être connecté en tant qu'admin SFD pour créer une demande de crédit");
      }
      
      const sfdId = user.user_metadata.sfd_id;
      
      // Generate reference
      const date = new Date();
      const year = date.getFullYear();
      
      // Get count of existing applications for this year to generate sequence number
      const { count, error: countError } = await supabase
        .from('credit_applications')
        .select('*', { count: 'exact', head: true })
        .like('reference', `CREDIT-${year}-%`);
        
      if (countError) throw countError;
      
      const sequence = String(count ? count + 1 : 1).padStart(3, '0');
      const reference = `CREDIT-${year}-${sequence}`;
      
      // Calculate score if not provided (simplified example)
      const calculatedScore = score || Math.floor(Math.random() * 40) + 60; // Random score between 60-99
      
      const { data, error } = await supabase
        .from('credit_applications')
        .insert({
          reference,
          sfd_id: sfdId,
          amount,
          purpose,
          status: 'pending',
          score: calculatedScore
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'create_credit_application',
        category: 'credit_management',
        status: 'success',
        target_resource: `credit_applications/${data.id}`,
        details: {
          reference,
          amount,
          purpose
        },
        severity: 'info'
      });
      
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
          .from('credit_applications')
          .update({
            status: 'approved',
            approval_comments: comments,
            approved_at: new Date().toISOString(),
            approved_by: user?.id
          })
          .eq('id', applicationId)
          .select()
          .single();
          
        if (error) throw error;
        
        // Create audit log
        await supabase.from('audit_logs').insert({
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
        
        return data;
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
          .from('credit_applications')
          .update({
            status: 'rejected',
            rejection_reason: reason,
            rejection_comments: comments,
            rejected_at: new Date().toISOString(),
            rejected_by: user?.id
          })
          .eq('id', applicationId)
          .select()
          .single();
          
        if (error) throw error;
        
        // Create audit log
        await supabase.from('audit_logs').insert({
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
        
        return data;
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
