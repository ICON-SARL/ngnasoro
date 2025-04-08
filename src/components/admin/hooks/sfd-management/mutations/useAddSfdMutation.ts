
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '../../../sfd/schemas/sfdFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useAddSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      if (!user) {
        throw new Error("Vous devez être connecté pour ajouter une SFD");
      }

      // Préparer les données pour l'insertion
      const newSfd = {
        name: sfdData.name,
        code: sfdData.code,
        region: sfdData.region || null,
        status: sfdData.status || 'active',
        logo_url: sfdData.logo_url || null,
        phone: sfdData.phone || null,
        subsidy_balance: sfdData.subsidy_balance || 0
      };

      try {
        console.log("Tentative de création de SFD avec les données:", newSfd);
        console.log("Admin ID utilisé:", user.id);
        
        // Supprimer tout cache existant avant l'opération
        queryClient.removeQueries({ queryKey: ['sfds'] });
        
        // Utiliser la nouvelle méthode améliorée avec anti-cache
        const { data: responseData } = await fetch('/api/create-sfd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          },
          body: JSON.stringify({
            sfd_data: newSfd,
            admin_id: user.id,
            timestamp: new Date().getTime() // Pour éviter le caching
          })
        }).then(res => {
          if (!res.ok) {
            return res.text().then(text => {
              try {
                // Tenter de parser le JSON d'erreur
                const errorData = JSON.parse(text);
                throw new Error(errorData.error || "Erreur lors de l'ajout de la SFD");
              } catch (e) {
                // Si ce n'est pas du JSON, utiliser le texte brut
                throw new Error(`Erreur lors de l'ajout de la SFD: ${text}`);
              }
            });
          }
          return res.json();
        });

        if (!responseData || !responseData.success) {
          const errorMsg = responseData?.error || "Échec de la création de la SFD";
          console.error("Échec de la création de la SFD:", errorMsg);
          throw new Error(errorMsg);
        }
        
        const sfdData = responseData.data;
        
        // Make sure we have a proper SFD object with an id
        if (!sfdData || typeof sfdData !== 'object' || !sfdData.id) {
          console.error("Réponse invalide reçue:", sfdData);
          throw new Error("Réponse invalide du serveur lors de la création de la SFD");
        }
        
        console.log("SFD créée avec succès:", sfdData);

        // Force un rafraîchissement immédiat des données de SFD
        queryClient.invalidateQueries({ queryKey: ['sfds'] });

        return {
          sfd: sfdData,
          hasSubsidy: newSfd.subsidy_balance > 0
        };
      } catch (error: any) {
        console.error("Erreur critique lors de l'ajout de la SFD:", error);
        
        // Provide more detailed error message to the user
        let errorMessage = "Une erreur est survenue lors de la création de la SFD";
        
        if (error.message) {
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError') ||
              error.message.includes('Failed to send')) {
            errorMessage = "Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.";
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Clear cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      // Force refetch immediately
      setTimeout(() => {
        console.log("Delayed refetch to ensure server consistency");
        queryClient.refetchQueries({ queryKey: ['sfds'] });
      }, 500);
      
      toast({
        title: 'SFD ajoutée',
        description: 'La nouvelle SFD a été ajoutée avec succès.',
      });

      if (user && data.sfd) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: data.sfd.id },
          status: 'success',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });
}
