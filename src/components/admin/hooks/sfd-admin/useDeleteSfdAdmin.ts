
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
        
        // Essayer de supprimer l'admin avec une stratégie de retry
        let retries = 3;
        let lastError: any = null;
        
        while (retries > 0) {
          try {
            await deleteSfdAdmin(adminId);
            console.log(`Administrateur SFD ${adminId} supprimé avec succès après ${3 - retries + 1} tentative(s)`);
            return adminId;
          } catch (err: any) {
            lastError = err;
            console.log(`Erreur lors de la tentative ${3 - retries + 1}, retries left: ${retries-1}`, err);
            
            // Récupérer le message d'erreur pour le journaliser
            const errorMessage = err.message || "Erreur inconnue";
            console.error(`Tentative ${3 - retries + 1} échouée: ${errorMessage}`);
            
            if (retries <= 1) {
              // Dernière tentative échouée, on propage l'erreur
              throw err;
            }
            
            retries--;
            // Attendre un délai croissant avant de réessayer (1s, puis 2s, puis 3s)
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
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
