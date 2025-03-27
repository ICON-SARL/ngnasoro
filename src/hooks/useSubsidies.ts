
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subsidyApi } from '@/utils/subsidyApi';
import { SfdSubsidy } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSubsidies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all subsidies
  const subsidiesQuery = useQuery({
    queryKey: ['subsidies'],
    queryFn: subsidyApi.getAllSubsidies,
    enabled: !!user
  });
  
  // Fetch all SFDs for the subsidy dropdown
  const sfdsQuery = useQuery({
    queryKey: ['sfds'],
    queryFn: subsidyApi.getAllSfds,
    enabled: !!user
  });
  
  // Create a new subsidy allocation
  const createSubsidy = useMutation({
    mutationFn: (subsidyData: {
      sfd_id: string;
      amount: number;
      description?: string;
      end_date?: string;
    }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return subsidyApi.createSubsidy({
        ...subsidyData,
        allocated_by: user.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Subvention allouée",
        description: "La subvention a été allouée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['subsidies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'allocation",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Revoke a subsidy
  const revokeSubsidy = useMutation({
    mutationFn: ({ subsidyId, reason }: { subsidyId: string; reason?: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return subsidyApi.revokeSubsidy(subsidyId, user.id, reason);
    },
    onSuccess: () => {
      toast({
        title: "Subvention révoquée",
        description: "La subvention a été révoquée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['subsidies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de révocation",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Get subsidy by ID
  const getSubsidyById = async (subsidyId: string) => {
    return subsidyApi.getSubsidyById(subsidyId);
  };

  // Get subsidy for a specific SFD
  const getSfdSubsidies = async (sfdId: string) => {
    return subsidyApi.getSfdSubsidies(sfdId);
  };

  return {
    subsidies: subsidiesQuery.data || [],
    sfds: sfdsQuery.data || [],
    isLoading: subsidiesQuery.isLoading || sfdsQuery.isLoading,
    isError: subsidiesQuery.isError || sfdsQuery.isError,
    createSubsidy,
    revokeSubsidy,
    getSubsidyById,
    getSfdSubsidies,
    refetch: subsidiesQuery.refetch
  };
}
