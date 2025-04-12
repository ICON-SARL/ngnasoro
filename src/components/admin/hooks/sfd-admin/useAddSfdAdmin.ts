
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { addSfdAdmin } from './sfdAdminApiService';
import { useAuth } from '@/hooks/auth';

export function useAddSfdAdmin() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { mutate: addSfdAdminMutation, isPending: isAdding } = useMutation({
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
        
        // Vérification basique du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adminData.email)) {
          throw new Error("Format d'email invalide");
        }
        
        // Vérification de la longueur du mot de passe
        if (adminData.password.length < 8) {
          throw new Error("Le mot de passe doit contenir au moins 8 caractères");
        }
        
        setError(null);
        console.log("Starting SFD admin creation process", adminData);
        
        // Limiter les tentatives pour éviter les boucles infinies
        let retries = 1; // Réduit à 1 seul retry pour éviter trop de tentatives inutiles
        let lastError = null;
        
        while (retries >= 0) {
          try {
            return await addSfdAdmin(adminData);
          } catch (err: any) {
            lastError = err;
            console.log(`Tentative échouée, tentatives restantes: ${retries}`);
            retries--;
            
            // Ne pas réessayer pour certaines erreurs spécifiques
            if (err.message?.includes('email est déjà utilisé') || 
                err.message?.includes('already registered') || 
                err.message?.includes('invalide') ||
                err.message?.includes('SFD spécifiée n\'existe pas')) {
              break;
            }
            
            // Attendre un court délai avant de réessayer
            if (retries >= 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        // Si toutes les tentatives ont échoué, lancer l'erreur
        if (lastError) {
          throw lastError;
        }
        
        throw new Error("Erreur inconnue lors de la création de l'administrateur");
      } catch (err: any) {
        console.error('Error creating SFD admin:', err);
        const errorMessage = err.message || "Une erreur s'est produite lors de la création de l'administrateur";
        setError(errorMessage);
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
      // Personnaliser le message selon le type d'erreur
      let errorMessage = error.message || "Erreur lors de la création de l'administrateur";
      
      // Messages d'erreur plus conviviaux pour les cas courants
      if (errorMessage.includes('already registered') || errorMessage.includes('déjà utilisé')) {
        errorMessage = "Cet email est déjà utilisé par un autre compte. Veuillez utiliser une autre adresse email.";
      } else if (errorMessage.includes('non-2xx status')) {
        errorMessage = "Le serveur a rencontré une erreur. Veuillez réessayer ultérieurement.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  return {
    addSfdAdmin: addSfdAdminMutation,
    isAdding,
    error
  };
}
