
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { subsidyService } from '@/services/subsidyService';

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

  // Fetch all subsidy requests
  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['meref-subsidy-requests'],
    queryFn: async () => {
      try {
        console.log("Récupération des demandes de subvention...");
        
        // Utilisation d'une requête simplifiée pour éviter des jointures complexes
        const { data, error } = await supabase
          .from('subsidy_requests')
          .select(`
            id,
            amount,
            purpose,
            status,
            created_at,
            region,
            sfd_id
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erreur lors de la récupération des demandes de subvention:", error);
          throw error;
        }

        // Récupérer les informations SFD séparément si nécessaire
        const formattedData = await Promise.all(data.map(async (item, index) => {
          const date = new Date(item.created_at);
          const year = date.getFullYear();
          const paddedIndex = String(index + 1).padStart(3, '0');
          
          // Récupérer le nom de la SFD séparément
          let sfdName = 'SFD inconnu';
          try {
            const { data: sfdData, error: sfdError } = await supabase
              .from('sfds')
              .select('name')
              .eq('id', item.sfd_id)
              .single();
              
            if (!sfdError && sfdData) {
              sfdName = sfdData.name;
            }
          } catch (sfdError) {
            console.warn("Impossible de récupérer les détails de la SFD:", sfdError);
          }
          
          return {
            id: item.id,
            reference: `CREDIT-${year}-${paddedIndex}`,
            sfd_id: item.sfd_id,
            sfd_name: sfdName,
            amount: item.amount,
            purpose: item.purpose,
            created_at: item.created_at,
            status: item.status,
            // Générer un score aléatoire entre 30 et 95 pour la démonstration
            score: Math.floor(Math.random() * (95 - 30 + 1)) + 30,
            region: item.region || 'Non spécifié'
          };
        }));

        console.log("Demandes de subvention récupérées:", formattedData.length);
        return formattedData;
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes de subvention:', error);
        return [];
      }
    }
  });

  // Approuver une demande de subvention en utilisant le service
  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      try {
        const result = await subsidyService.approveSubsidyRequest(requestId);
        return result;
      } catch (error) {
        console.error("Erreur lors de l'approbation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Demande approuvée",
        description: "La demande de subvention a été approuvée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['meref-subsidy-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'approbation",
        variant: "destructive",
      });
    }
  });

  // Rejeter une demande de subvention en utilisant le service
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      try {
        const result = await subsidyService.rejectSubsidyRequest(requestId);
        return result;
      } catch (error) {
        console.error("Erreur lors du rejet:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Demande rejetée",
        description: "La demande de subvention a été rejetée",
      });
      queryClient.invalidateQueries({ queryKey: ['meref-subsidy-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du rejet",
        variant: "destructive",
      });
    }
  });

  return {
    requests: requests || [],
    isLoading,
    isError,
    approveRequest,
    rejectRequest,
    refetch
  };
}
