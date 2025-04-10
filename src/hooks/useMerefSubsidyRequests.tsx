
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        const { data, error } = await supabase
          .from('subsidy_requests')
          .select(`
            id,
            amount,
            purpose,
            status,
            created_at,
            region,
            sfds:sfd_id(id, name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Générer une référence de style CREDIT-YYYY-XXX pour chaque demande
        const formattedData = data.map((item, index) => {
          const date = new Date(item.created_at);
          const year = date.getFullYear();
          // Formater l'index pour avoir au moins 3 chiffres
          const paddedIndex = String(index + 1).padStart(3, '0');
          return {
            id: item.id,
            reference: `CREDIT-${year}-${paddedIndex}`,
            sfd_id: item.sfds ? item.sfds.id : '',
            sfd_name: item.sfds ? item.sfds.name : 'SFD inconnu',
            amount: item.amount,
            purpose: item.purpose,
            created_at: item.created_at,
            status: item.status,
            // Générer un score aléatoire entre 30 et 95 pour la démonstration
            score: Math.floor(Math.random() * (95 - 30 + 1)) + 30,
            region: item.region || 'Non spécifié'
          };
        });

        return formattedData;
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes de subvention:', error);
        return [];
      }
    }
  });

  // Approuver une demande de subvention
  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)
        .select();

      if (error) throw error;
      return data;
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

  // Rejeter une demande de subvention
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)
        .select();

      if (error) throw error;
      return data;
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
