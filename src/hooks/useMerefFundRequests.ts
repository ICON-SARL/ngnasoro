
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';

export interface MerefFundRequest {
  id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  credited_at?: string;
  comments?: string;
  requested_by?: string;
}

interface FundRequestFormData {
  sfdId: string;
  amount: number;
  purpose: string;
  justification: string;
}

export function useMerefFundRequests() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Mock fund requests data for development
  const mockFundRequests: MerefFundRequest[] = [
    {
      id: '1',
      sfd_id: 'sfd-123',
      amount: 1000000,
      purpose: 'Expansion des services financiers',
      justification: 'Permettre d\'atteindre les zones rurales avec des services financiers de base',
      status: 'pending',
      created_at: new Date().toISOString(),
      requested_by: 'user-123'
    },
    {
      id: '2',
      sfd_id: 'sfd-456',
      amount: 500000,
      purpose: 'Digitalisation des services',
      justification: 'Modernisation des processus pour améliorer l\'efficacité opérationnelle',
      status: 'approved',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      approved_by: 'admin-123',
      requested_by: 'user-456'
    }
  ];
  
  const createFundRequest = async (request: FundRequestFormData) => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Submit request to the database
      const { data, error } = await supabase
        .from('subsidy_requests')
        .insert({
          sfd_id: request.sfdId,
          amount: request.amount,
          purpose: request.purpose,
          justification: request.justification,
          requested_by: user.id,
          status: 'pending',
          priority: 'normal'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de financement a été envoyée avec succès',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'envoi de la demande',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to fetch fund requests from the database
  const fetchFundRequests = async (): Promise<MerefFundRequest[]> => {
    try {
      // In a real implementation, we would fetch from Supabase
      // For now, return mock data
      return mockFundRequests;
    } catch (error) {
      console.error('Error fetching fund requests:', error);
      return [];
    }
  };
  
  // Use React Query to manage the data fetching
  const { data: fundRequests, isLoading, refetch } = useQuery({
    queryKey: ['fundRequests'],
    queryFn: fetchFundRequests,
    initialData: mockFundRequests
  });
  
  // Mutation for approving fund requests
  const approveFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      // In a real implementation, we would update in Supabase
      console.log(`Approving request ${requestId} with comments: ${comments}`);
      return { success: true };
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Demande approuvée',
        description: 'La demande de financement a été approuvée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'approbation',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for rejecting fund requests
  const rejectFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      // In a real implementation, we would update in Supabase
      console.log(`Rejecting request ${requestId} with comments: ${comments}`);
      return { success: true };
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Demande rejetée',
        description: 'La demande de financement a été rejetée',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du rejet',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for executing fund transfers
  const executeFundTransfer = useMutation({
    mutationFn: async (requestId: string) => {
      // In a real implementation, we would update in Supabase
      console.log(`Executing transfer for request ${requestId}`);
      return { success: true };
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Transfert effectué',
        description: 'Le transfert de fonds a été effectué avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du transfert',
        variant: 'destructive',
      });
    }
  });
  
  return {
    createFundRequest,
    isSubmitting,
    fundRequests: fundRequests || [],
    isLoading,
    refetch,
    approveFundRequest: approveFundRequest,
    rejectFundRequest: rejectFundRequest,
    executeFundTransfer: executeFundTransfer
  };
}
