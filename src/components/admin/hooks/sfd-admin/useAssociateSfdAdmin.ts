
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour associer un administrateur à une SFD
 */
export function useAssociateSfdAdmin() {
  const [isAssociating, setIsAssociating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const associateAdminWithSfd = async (adminId: string, sfdId: string, makeDefault: boolean = true) => {
    setIsAssociating(true);
    setError(null);

    try {
      console.log(`Tentative d'association de l'admin ${adminId} avec la SFD ${sfdId} (défaut: ${makeDefault})`);
      
      // Use the edge function to associate admin with SFD to bypass RLS issues
      const { data, error } = await supabase.functions.invoke('associate-sfd-admin', {
        body: { 
          adminId,
          sfdId,
          makeDefault
        }
      });
      
      if (error) {
        console.error('Erreur lors de l\'appel de la fonction:', error);
        throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Aucune donnée reçue de la fonction');
      }
      
      // Handle potential error returned in data
      if (data.error) {
        console.error('Erreur retournée par la fonction:', data.error);
        throw new Error(data.error);
      }
      
      console.log("Association réussie:", data);
      
      toast({
        title: 'Association réussie',
        description: `L'administrateur a été associé à la SFD avec succès.`
      });

      // Invalider les requêtes pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      
      return true;
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
