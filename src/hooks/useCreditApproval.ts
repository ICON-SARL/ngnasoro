
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Mock data for credit applications
  const mockApplications: CreditApplication[] = [
    {
      id: "1",
      reference: "CREDIT-2023-001",
      sfd_id: "sfd1",
      sfd_name: "RCPB Ouagadougou",
      amount: 5000000,
      purpose: "Expansion des activités de microfinance",
      created_at: "2023-04-25T10:30:00Z",
      status: "pending",
      score: 75
    },
    {
      id: "2",
      reference: "CREDIT-2023-002",
      sfd_id: "sfd2",
      sfd_name: "Microcred Abidjan",
      amount: 3000000,
      purpose: "Ouverture d'une nouvelle agence",
      created_at: "2023-04-24T14:15:00Z",
      status: "pending",
      score: 83
    }
  ];

  // Fetch credit applications
  const fetchCreditApplications = async (): Promise<CreditApplication[]> => {
    try {
      // In a real implementation, we would fetch from Supabase
      // For now, return mock data
      return mockApplications;
    } catch (error) {
      console.error('Error fetching credit applications:', error);
      return [];
    }
  };

  // Use React Query to manage the data fetching
  const { data: applications, refetch } = useQuery({
    queryKey: ['credit-applications'],
    queryFn: fetchCreditApplications,
    initialData: mockApplications
  });

  // Approve credit application
  const approveCredit = useMutation({
    mutationFn: async ({ applicationId, comments }: { applicationId: string; comments?: string }) => {
      setIsLoading(true);
      try {
        // In a real implementation, we would update in Supabase
        console.log(`Approving credit application ${applicationId} with comments: ${comments}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
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
      setIsLoading(true);
      try {
        // In a real implementation, we would update in Supabase
        console.log(`Rejecting credit application ${applicationId} with reason: ${reason}, comments: ${comments}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
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
    applications: applications || [],
    isLoading,
    refetch,
    approveCredit,
    rejectCredit
  };
}
