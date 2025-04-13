
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { setupDatabase, synchronizeUserRoles } from '@/utils/setupDatabase';

export function useActivateTables() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activateSystem = async () => {
    setLoading(true);
    try {
      toast({
        title: "Activation du système",
        description: "Configuration et activation des tables en cours...",
      });

      // Utiliser la fonction de configuration améliorée
      const success = await setupDatabase();
      
      if (!success) {
        console.error("Erreur lors de la configuration de la base de données");
        toast({
          title: "Erreur",
          description: "Impossible de configurer le système",
          variant: "destructive",
        });
        return false;
      }

      console.log("Configuration du système réussie");
      toast({
        title: "Activation réussie",
        description: "Le système a été configuré et activé avec succès",
      });
      return true;
    } catch (err) {
      console.error("Erreur pendant l'activation:", err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue pendant l'activation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activateUserRolesSync = async () => {
    setLoading(true);
    try {
      toast({
        title: "Synchronisation en cours",
        description: "Synchronisation des rôles utilisateurs...",
      });

      const success = await synchronizeUserRoles();
      
      if (!success) {
        console.error("Erreur lors de la synchronisation des rôles");
        toast({
          title: "Erreur",
          description: "Impossible de synchroniser les rôles utilisateurs",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Synchronisation réussie",
        description: "Les rôles utilisateurs ont été synchronisés avec succès",
      });
      return true;
    } catch (err) {
      console.error("Erreur pendant la synchronisation:", err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue pendant la synchronisation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    activateSystem,
    activateUserRolesSync
  };
}
