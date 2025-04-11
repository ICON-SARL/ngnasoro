
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createSfdAdmin } from './sfdAdminApiService';
import { useAuth } from '@/hooks/auth';

export function useAddSfdAdmin() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

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
        
        // Vérifier que tous les champs requis sont présents
        if (!adminData.email || !adminData.password || !adminData.full_name || !adminData.sfd_id) {
          throw new Error("Tous les champs obligatoires doivent être remplis");
        }
        
        setError(null);
        console.log("Starting SFD admin creation process", adminData);
        
        // Essayer de créer l'admin avec une stratégie de retry
        let retries = 3;
        while (retries > 0) {
          try {
            return await createSfdAdmin(adminData);
          } catch (err: any) {
            if (retries <= 1 || !err.message?.includes('infinite recursion')) {
              throw err;
            }
            
            console.log(`Retry attempt, retries left: ${retries-1}`);
            retries--;
            // Attendre un court délai avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        throw new Error("Nombre maximum de tentatives atteint");
      } catch (err: any) {
        console.error('Error creating SFD admin:', err);
        setError(err.message || "Une erreur s'est produite lors de la création de l'administrateur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création de l'administrateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    addSfdAdmin,
    isAdding,
    error
  };
}
