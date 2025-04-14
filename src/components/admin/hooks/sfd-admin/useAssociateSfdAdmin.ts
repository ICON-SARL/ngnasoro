
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSfdAssociation } from '@/hooks/admin/useSfdAssociation';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook pour associer un administrateur à une SFD
 */
export function useAssociateSfdAdmin() {
  const [isAssociating, setIsAssociating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { associateWithSfd } = useSfdAssociation();
  const queryClient = useQueryClient();

  const associateAdminWithSfd = async (adminId: string, sfdId: string, makeDefault: boolean = true) => {
    setIsAssociating(true);
    setError(null);

    try {
      const success = await associateWithSfd({
        userId: adminId,
        sfdId: sfdId,
        makeDefault
      });

      if (success) {
        toast({
          title: 'Association réussie',
          description: `L'administrateur a été associé à la SFD avec succès.`
        });

        // Invalider les requêtes pour forcer un rechargement des données
        queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
        queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
        
        return true;
      } else {
        throw new Error("Échec de l'association");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'association admin-SFD:", err);
      setError(err.message || "Une erreur s'est produite lors de l'association");
      
      toast({
        title: 'Erreur',
        description: err.message || "Une erreur s'est produite lors de l'association",
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsAssociating(false);
    }
  };

  return {
    associateAdminWithSfd,
    isAssociating,
    error
  };
}
