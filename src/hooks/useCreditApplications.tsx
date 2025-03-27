
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type CreditApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface CreditApplication {
  id: string;
  reference: string;
  sfd_id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  created_at: string;
  status: CreditApplicationStatus;
  score: number;
  rejection_reason?: string;
  rejection_comments?: string;
  approval_comments?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
}

export function useCreditApplications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    },
    {
      id: "3",
      reference: "CREDIT-2023-003",
      sfd_id: "sfd3",
      sfd_name: "FUCEC Lomé",
      amount: 7500000,
      purpose: "Programme de prêts agricoles",
      created_at: "2023-04-23T09:45:00Z",
      status: "approved",
      score: 92,
      approved_at: "2023-04-26T11:20:00Z",
      approved_by: "admin1",
      approval_comments: "Excellent historique, projet viable"
    },
    {
      id: "4",
      reference: "CREDIT-2023-004",
      sfd_id: "sfd4",
      sfd_name: "ACEP Dakar",
      amount: 2000000,
      purpose: "Digitalisation des opérations",
      created_at: "2023-04-22T16:30:00Z",
      status: "rejected",
      score: 42,
      rejected_at: "2023-04-25T13:40:00Z",
      rejected_by: "admin1",
      rejection_reason: "risque_eleve",
      rejection_comments: "Niveau d'endettement actuel trop élevé"
    },
    {
      id: "5",
      reference: "CREDIT-2023-005",
      sfd_id: "sfd5",
      sfd_name: "PAMECAS Thiès",
      amount: 4500000,
      purpose: "Fonds de crédit pour micro-entrepreneurs",
      created_at: "2023-04-21T11:00:00Z",
      status: "pending",
      score: 61
    }
  ];

  // Fetch applications query
  const query = useQuery({
    queryKey: ['credit-applications'],
    queryFn: async () => {
      // In a real implementation, this would fetch from Supabase
      // For now, return mock data
      console.log("Fetching credit applications...");
      return mockApplications;
    }
  });

  // Approve application mutation
  const approveApplication = useMutation({
    mutationFn: async ({ applicationId, comments }: { applicationId: string, comments?: string }) => {
      // In a real implementation, this would update the application in Supabase
      console.log(`Approving application ${applicationId} with comments: ${comments}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For this mock, just return success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      
      // In a real implementation, would trigger notification to SFD
      console.log("Would send approval notification here");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'approbation",
        description: error.message || "Une erreur est survenue lors de l'approbation",
        variant: "destructive",
      });
    }
  });

  // Reject application mutation
  const rejectApplication = useMutation({
    mutationFn: async ({ 
      applicationId, 
      rejectionReason, 
      comments 
    }: { 
      applicationId: string, 
      rejectionReason: string, 
      comments?: string 
    }) => {
      // In a real implementation, this would update the application in Supabase
      console.log(`Rejecting application ${applicationId} with reason: ${rejectionReason} and comments: ${comments}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For this mock, just return success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      
      // In a real implementation, would trigger notification to SFD
      console.log("Would send rejection notification here");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de rejet",
        description: error.message || "Une erreur est survenue lors du rejet",
        variant: "destructive",
      });
    }
  });

  return {
    applications: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    approveApplication,
    rejectApplication
  };
}
