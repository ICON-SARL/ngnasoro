
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  createSfdAdmin, 
  deleteSfdAdmin as deleteSfdAdminApi, 
  fetchSfdAdmins 
} from './sfdAdminApiService';
import { useAuth } from '@/hooks/auth';

export function useSfdAdminManagement() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Query to fetch SFD admins
  const { data: sfdAdmins, isLoading: isLoadingAdmins, refetch } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      try {
        return await fetchSfdAdmins();
      } catch (err: any) {
        console.error('Error fetching SFD admins:', err);
        setError(err.message || "Erreur lors de la récupération des administrateurs SFD");
        return [];
      }
    }
  });

  // Mutation to add a SFD admin
  const { mutate: addSfdAdmin, isPending: isAdding } = useMutation({
    mutationFn: async (adminData: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      sfd_id: string;
      notify: boolean;
    }) => {
      try {
        if (!user) {
          throw new Error("Vous devez être connecté pour effectuer cette action");
        }
        
        setError(null);
        console.log("Creating SFD admin with data:", { 
          ...adminData, 
          password: "***" // Hide password in logs 
        });
        
        return await createSfdAdmin(adminData);
      } catch (err: any) {
        console.error('Error adding SFD admin:', err);
        setError(err.message || "Une erreur s'est produite lors de la création de l'administrateur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été créé avec succès.",
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'administrateur SFD: ${err.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete a SFD admin
  const { mutate: deleteSfdAdmin, isPending: isDeleting } = useMutation({
    mutationFn: async (adminId: string) => {
      try {
        setError(null);
        return await deleteSfdAdminApi(adminId);
      } catch (err: any) {
        console.error('Error deleting SFD admin:', err);
        setError(err.message || "Une erreur s'est produite lors de la suppression de l'administrateur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été supprimé avec succès.",
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'administrateur SFD: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    sfdAdmins,
    isLoading: isLoadingAdmins || isAdding || isDeleting,
    error,
    addSfdAdmin,
    deleteSfdAdmin,
    refetchAdmins: refetch
  };
}
