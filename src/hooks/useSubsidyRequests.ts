import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subsidyRequestsApi } from '@/utils/subsidyRequestsApi';
import { SubsidyRequestFilter } from '@/types/subsidyRequests';
import { useToast } from '@/hooks/use-toast';
import { useSubsidyNotifications } from '@/hooks/useSubsidyNotifications';

export function useSubsidyRequests(filters?: SubsidyRequestFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createRequestNotification, createDecisionNotification } = useSubsidyNotifications();
  
  // Fetch all subsidy requests
  const subsidyRequestsQuery = useQuery({
    queryKey: ['subsidyRequests', filters],
    queryFn: () => subsidyRequestsApi.getAllSubsidyRequests(filters)
  });
  
  // Get a single subsidy request
  const getSubsidyRequestById = async (id: string) => {
    return subsidyRequestsApi.getSubsidyRequestById(id);
  };
  
  // Fetch subsidy request activities
  const getSubsidyRequestActivities = async (requestId: string) => {
    return subsidyRequestsApi.getSubsidyRequestActivities(requestId);
  };
  
  // Create a new subsidy request with notification
  const createSubsidyRequest = useMutation({
    mutationFn: subsidyRequestsApi.createSubsidyRequest,
    onSuccess: (newRequest) => {
      toast({
        title: "Demande créée",
        description: "La demande de subvention a été créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['subsidyRequests'] });
      
      // Send notification to super admins
      createRequestNotification.mutate(newRequest);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la demande",
        variant: "destructive",
      });
    }
  });

  // Update subsidy request status with notification
  const updateSubsidyRequestStatus = useMutation({
    mutationFn: ({ 
      requestId, 
      status, 
      comments 
    }: { 
      requestId: string; 
      status: 'pending' | 'under_review' | 'approved' | 'rejected'; 
      comments?: string;
    }) => {
      return subsidyRequestsApi.updateSubsidyRequestStatus(requestId, status, comments);
    },
    onSuccess: (updatedRequest, variables) => {
      const statusMessages = {
        pending: "en attente",
        under_review: "en cours d'examen",
        approved: "approuvée",
        rejected: "rejetée"
      };
      
      toast({
        title: "Statut mis à jour",
        description: `La demande est maintenant ${statusMessages[variables.status]}`,
      });
      queryClient.invalidateQueries({ queryKey: ['subsidyRequests'] });
      
      // If approved or rejected, send notification to SFD admin
      if ((variables.status === 'approved' || variables.status === 'rejected') && 
          updatedRequest.requested_by) {
        createDecisionNotification.mutate({
          requestId: updatedRequest.id,
          sfdAdminId: updatedRequest.requested_by,
          status: variables.status as 'approved' | 'rejected',
          amount: updatedRequest.amount
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  });
  
  // Update subsidy request priority
  const updateSubsidyRequestPriority = useMutation({
    mutationFn: ({ 
      requestId, 
      priority 
    }: { 
      requestId: string; 
      priority: 'low' | 'normal' | 'high' | 'urgent';
    }) => {
      return subsidyRequestsApi.updateSubsidyRequestPriority(requestId, priority);
    },
    onSuccess: (_data, variables) => {
      const priorityMessages = {
        low: "basse",
        normal: "normale",
        high: "haute",
        urgent: "urgente"
      };
      
      toast({
        title: "Priorité mise à jour",
        description: `La priorité est maintenant ${priorityMessages[variables.priority]}`,
      });
      queryClient.invalidateQueries({ queryKey: ['subsidyRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la priorité",
        variant: "destructive",
      });
    }
  });
  
  // Get alert thresholds
  const alertThresholdsQuery = useQuery({
    queryKey: ['subsidyAlertThresholds'],
    queryFn: subsidyRequestsApi.getAlertThresholds
  });
  
  // Create alert threshold
  const createAlertThreshold = useMutation({
    mutationFn: subsidyRequestsApi.createAlertThreshold,
    onSuccess: () => {
      toast({
        title: "Seuil d'alerte créé",
        description: "Le seuil d'alerte a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['subsidyAlertThresholds'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du seuil d'alerte",
        variant: "destructive",
      });
    }
  });
  
  // Update alert threshold
  const updateAlertThreshold = useMutation({
    mutationFn: ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: {
        threshold_name?: string;
        threshold_amount?: number;
        notification_emails?: string[];
        is_active?: boolean;
      }
    }) => {
      const dbUpdates: any = {};
      if (updates.threshold_amount) {
        dbUpdates.low_threshold = updates.threshold_amount;
        dbUpdates.critical_threshold = updates.threshold_amount * 0.5;
      }
      return subsidyRequestsApi.updateAlertThreshold(id, dbUpdates);
    },
    onSuccess: () => {
      toast({
        title: "Seuil d'alerte mis à jour",
        description: "Le seuil d'alerte a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['subsidyAlertThresholds'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du seuil d'alerte",
        variant: "destructive",
      });
    }
  });
  
  // Delete alert threshold
  const deleteAlertThreshold = useMutation({
    mutationFn: (id: string) => {
      return subsidyRequestsApi.deleteAlertThreshold(id);
    },
    onSuccess: () => {
      toast({
        title: "Seuil d'alerte supprimé",
        description: "Le seuil d'alerte a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['subsidyAlertThresholds'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du seuil d'alerte",
        variant: "destructive",
      });
    }
  });

  return {
    subsidyRequests: subsidyRequestsQuery.data || [],
    isLoading: subsidyRequestsQuery.isLoading,
    isError: subsidyRequestsQuery.isError,
    getSubsidyRequestById,
    getSubsidyRequestActivities,
    createSubsidyRequest,
    updateSubsidyRequestStatus,
    updateSubsidyRequestPriority,
    alertThresholds: alertThresholdsQuery.data || [],
    isLoadingThresholds: alertThresholdsQuery.isLoading,
    createAlertThreshold,
    updateAlertThreshold,
    deleteAlertThreshold,
    refetch: subsidyRequestsQuery.refetch
  };
}
