
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { deleteSfdAdmin } from './sfdAdminApiService';

export function useDeleteSfdAdmin() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: async (adminId: string) => {
      try {
        if (!adminId) {
          throw new Error("ID d'administrateur requis");
        }
        
        setError(null);
        console.log(`Tentative de suppression de l'administrateur SFD avec l'ID: ${adminId}`);
        
        // Stratégie de retry simplifiée mais efficace
        let retries = 3;
        let lastError: any = null;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`Tentative ${attempt}/${retries} de suppression de l'admin ${adminId}`);
            const result = await deleteSfdAdmin(adminId);
            console.log(`Administrateur SFD ${adminId} supprimé avec succès après ${attempt} tentative(s)`, result);
            return adminId;
          } catch (err: any) {
            lastError = err;
            console.error(`Erreur lors de la tentative ${attempt}/${retries}:`, err);
            
            // Si c'est la dernière tentative, on propage l'erreur
            if (attempt >= retries) {
              console.error(`Toutes les tentatives ont échoué pour supprimer l'admin ${adminId}`);
              throw err;
            }
            
            // Attendre avec un délai exponentiel avant de réessayer
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`Nouvel essai dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        throw lastError || new Error("Nombre maximum de tentatives atteint");
      } catch (err: any) {
        console.error('Error deleting SFD admin:', err);
        const errorMsg = err.message || "Une erreur s'est produite lors de la suppression de l'administrateur";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    onSuccess: (adminId) => {
      console.log(`Suppression réussie de l'admin ID: ${adminId}`);
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      console.error("Erreur dans la mutation delete:", error);
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de l'administrateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    deleteSfdAdmin: mutate,
    isDeleting,
    error
  };
}
