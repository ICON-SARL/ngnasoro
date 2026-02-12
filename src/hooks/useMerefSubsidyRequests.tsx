
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { subsidyService } from '@/services/subsidyService';
import { logger } from '@/utils/logger';

interface MerefSubsidyRequest {
  id: string;
  reference: string;
  sfd_id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  score?: number;
  region?: string;
}

export function useMerefSubsidyRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['meref-subsidy-requests'],
    queryFn: async () => {
      try {
        logger.debug("Récupération des demandes de subvention...");
        
        const { data, error } = await supabase
          .from('subsidy_requests')
          .select('id, amount, justification, status, created_at, sfd_id')
          .order('created_at', { ascending: false });

        if (error) {
          logger.error("Erreur lors de la récupération des demandes de subvention:", error);
          throw error;
        }

        const sfdIds = data.map(item => item.sfd_id);
        
        let sfdsMap: Record<string, string> = {};
        if (sfdIds.length > 0) {
          const { data: sfdsData, error: sfdsError } = await supabase
            .from('sfds')
            .select('id, name')
            .in('id', sfdIds);
            
          if (!sfdsError && sfdsData) {
            sfdsMap = sfdsData.reduce((acc: Record<string, string>, sfd) => {
              acc[sfd.id] = sfd.name;
              return acc;
            }, {});
          } else {
            logger.warn("Impossible de récupérer les détails des SFDs:", sfdsError);
          }
        }
        
        const formattedData = data.map((item, index) => {
          const date = new Date(item.created_at);
          const year = date.getFullYear();
          const paddedIndex = String(index + 1).padStart(3, '0');
          
          return {
            id: item.id,
            reference: `CREDIT-${year}-${paddedIndex}`,
            sfd_id: item.sfd_id,
            sfd_name: sfdsMap[item.sfd_id] || 'SFD inconnu',
            amount: item.amount,
            purpose: item.justification || 'Non spécifié',
            created_at: item.created_at,
            status: item.status,
            score: Math.floor(Math.random() * (95 - 30 + 1)) + 30,
            region: 'Non spécifié'
          };
        });

        logger.debug(`${formattedData.length} demandes de subvention récupérées`);
        return formattedData;
      } catch (error) {
        logger.error('Erreur lors de la récupération des demandes de subvention:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      logger.debug("Tentative d'approbation de la requête:", requestId);
      const result = await subsidyService.approveSubsidyRequest(requestId);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Demande approuvée", description: "La demande de subvention a été approuvée avec succès" });
      queryClient.invalidateQueries({ queryKey: ['meref-subsidy-requests'] });
    },
    onError: (error: Error) => {
      logger.error("Erreur d'approbation:", error.message);
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue lors de l'approbation", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (params: { requestId: string, comments?: string }) => {
      logger.debug("Tentative de rejet de la requête:", params.requestId);
      const result = await subsidyService.rejectSubsidyRequest(params.requestId, params.comments);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Demande rejetée", description: "La demande de subvention a été rejetée" });
      queryClient.invalidateQueries({ queryKey: ['meref-subsidy-requests'] });
    },
    onError: (error: Error) => {
      logger.error("Erreur de rejet:", error.message);
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue lors du rejet", variant: "destructive" });
    }
  });

  return {
    requests: requests || [],
    isLoading,
    isError,
    approveRequest: (requestId: string) => approveMutation.mutate(requestId),
    rejectRequest: (requestId: string, comments?: string) => rejectMutation.mutate({ requestId, comments }),
    refetch
  };
}
