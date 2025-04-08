
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SubsidyRequest, SubsidyRequestActivity, SubsidyAlertThreshold } from '@/types/subsidyRequests';

// Mock data - in a real app this would come from Supabase
const mockSubsidyRequests: SubsidyRequest[] = [
  {
    id: '1',
    sfd_id: 'sfd1',
    sfd_name: 'RCPB Ouagadougou',
    requested_by: 'user1',
    requester_name: 'Amadou Diallo',
    amount: 25000000,
    purpose: 'Financement des activités agricoles',
    justification: 'Pour soutenir les petits agriculteurs pendant la saison des semences',
    status: 'pending',
    priority: 'high',
    created_at: '2023-05-15T10:30:00Z',
    region: 'Centre',
    expected_impact: 'Améliorer la production agricole dans la région du Centre',
    alert_triggered: false
  },
  {
    id: '2',
    sfd_id: 'sfd2',
    sfd_name: 'Microcred Abidjan',
    requested_by: 'user2',
    requester_name: 'Kofi Mensah',
    amount: 15000000,
    purpose: 'Programme de microfinance pour femmes entrepreneures',
    justification: 'Soutenir les initiatives commerciales dirigées par des femmes',
    status: 'approved',
    priority: 'normal',
    created_at: '2023-05-10T09:15:00Z',
    reviewed_at: '2023-05-12T14:30:00Z',
    reviewed_by: 'admin1',
    reviewer_name: 'Admin User',
    decision_comments: 'Projet viable avec un fort impact potentiel',
    region: 'Abidjan',
    expected_impact: 'Autonomiser économiquement les femmes entrepreneures',
    alert_triggered: false
  },
  {
    id: '3',
    sfd_id: 'sfd3',
    sfd_name: 'FUCEC Lomé',
    requested_by: 'user3',
    requester_name: 'Ama Serwah',
    amount: 40000000,
    purpose: 'Extension des services financiers dans les zones rurales',
    justification: 'Atteindre les populations non bancarisées dans les régions éloignées',
    status: 'rejected',
    priority: 'urgent',
    created_at: '2023-05-05T11:45:00Z',
    reviewed_at: '2023-05-08T16:20:00Z',
    reviewed_by: 'admin2',
    reviewer_name: 'Admin Manager',
    decision_comments: 'Budget insuffisamment détaillé, risque opérationnel élevé',
    region: 'Maritime',
    alert_triggered: true
  },
  {
    id: '4',
    sfd_id: 'sfd4',
    sfd_name: 'ACEP Dakar',
    requested_by: 'user4',
    requester_name: 'Moussa Sall',
    amount: 30000000,
    purpose: 'Numérisation des services financiers',
    justification: 'Moderniser notre infrastructure technologique pour améliorer l\'efficacité',
    status: 'under_review',
    priority: 'high',
    created_at: '2023-05-01T13:20:00Z',
    region: 'Dakar',
    expected_impact: 'Réduire les délais de traitement et améliorer l\'expérience client',
    alert_triggered: false
  }
];

// Mock alert thresholds
const mockAlertThresholds: SubsidyAlertThreshold[] = [
  {
    id: '1',
    threshold_name: 'Seuil standard',
    threshold_amount: 20000000,
    notification_emails: ['admin@meref.org'],
    created_at: '2023-01-15T08:00:00Z',
    is_active: true
  },
  {
    id: '2',
    threshold_name: 'Seuil élevé',
    threshold_amount: 35000000,
    notification_emails: ['admin@meref.org', 'director@meref.org'],
    created_at: '2023-01-15T08:15:00Z',
    is_active: true
  }
];

// Mock activities
const mockActivities: SubsidyRequestActivity[] = [
  {
    id: '1',
    request_id: '1',
    activity_type: 'request_created',
    performed_by: 'user1',
    performer_name: 'Amadou Diallo',
    performed_at: '2023-05-15T10:30:00Z',
    description: 'Demande de subvention créée'
  },
  {
    id: '2',
    request_id: '2',
    activity_type: 'request_created',
    performed_by: 'user2',
    performer_name: 'Kofi Mensah',
    performed_at: '2023-05-10T09:15:00Z',
    description: 'Demande de subvention créée'
  },
  {
    id: '3',
    request_id: '2',
    activity_type: 'request_under_review',
    performed_by: 'admin1',
    performer_name: 'Admin User',
    performed_at: '2023-05-11T11:30:00Z',
    description: 'Demande mise en examen'
  },
  {
    id: '4',
    request_id: '2',
    activity_type: 'request_approved',
    performed_by: 'admin1',
    performer_name: 'Admin User',
    performed_at: '2023-05-12T14:30:00Z',
    description: 'Demande approuvée',
    details: {
      comments: 'Projet viable avec un fort impact potentiel'
    }
  }
];

// Type for hook parameters
interface UseSubsidyRequestsParams {
  sfdId?: string;
}

export function useSubsidyRequests(params?: UseSubsidyRequestsParams) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // Fetch all requests
  const subsidyRequestsQuery = useQuery({
    queryKey: ['subsidy-requests', params?.sfdId, filterStatus, filterPriority],
    queryFn: async () => {
      if (params?.sfdId) {
        return mockSubsidyRequests.filter(req => req.sfd_id === params.sfdId);
      }
      return mockSubsidyRequests;
    }
  });

  // Fetch alert thresholds
  const alertThresholdsQuery = useQuery({
    queryKey: ['subsidy-alert-thresholds'],
    queryFn: async () => {
      return mockAlertThresholds;
    }
  });

  // Get request by ID
  const getSubsidyRequestById = async (requestId: string) => {
    // In a real app, this would be a call to Supabase
    return mockSubsidyRequests.find(req => req.id === requestId);
  };
  
  // Get activities for a request
  const getSubsidyRequestActivities = async (requestId: string) => {
    // In a real app, this would be a call to Supabase
    return mockActivities.filter(activity => activity.request_id === requestId);
  };

  // Create request mutation
  const createSubsidyRequest = useMutation({
    mutationFn: async (requestData: Omit<SubsidyRequest, 'id' | 'created_at' | 'status' | 'alert_triggered'>) => {
      console.log('Creating subsidy request:', requestData);
      
      // In a real app, this would save to Supabase
      const newRequest = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'pending',
        alert_triggered: false,
        ...requestData
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return newRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
      toast({
        title: "Demande créée",
        description: "La demande de prêt a été soumise avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la demande",
        variant: "destructive",
      });
    }
  });

  // Update status mutation
  const updateSubsidyRequestStatus = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      comments 
    }: { 
      requestId: string, 
      status: 'pending' | 'under_review' | 'approved' | 'rejected', 
      comments?: string 
    }) => {
      console.log(`Updating request ${requestId} status to ${status}. Comments: ${comments}`);
      
      // In a real app, this would update Supabase
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la demande a été mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  });

  // Update priority mutation
  const updateSubsidyRequestPriority = useMutation({
    mutationFn: async ({ 
      requestId, 
      priority 
    }: { 
      requestId: string, 
      priority: 'low' | 'normal' | 'high' | 'urgent' 
    }) => {
      console.log(`Updating request ${requestId} priority to ${priority}`);
      
      // In a real app, this would update Supabase
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
      toast({
        title: "Priorité mise à jour",
        description: "La priorité de la demande a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la priorité",
        variant: "destructive",
      });
    }
  });

  // Function to refetch data
  const refetch = () => {
    subsidyRequestsQuery.refetch();
  };

  return {
    subsidyRequests: subsidyRequestsQuery.data || [],
    isLoading: subsidyRequestsQuery.isLoading,
    isError: subsidyRequestsQuery.isError,
    alertThresholds: alertThresholdsQuery.data || [],
    isLoadingThresholds: alertThresholdsQuery.isLoading,
    filterStatus,
    filterPriority,
    setFilterStatus,
    setFilterPriority,
    getSubsidyRequestById,
    getSubsidyRequestActivities,
    createSubsidyRequest,
    updateSubsidyRequestStatus,
    updateSubsidyRequestPriority,
    refetch
  };
}
