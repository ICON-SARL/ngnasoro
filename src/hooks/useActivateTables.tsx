
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useActivateTables() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activateUserRolesSync = async () => {
    setLoading(true);
    try {
      toast({
        title: "Synchronisation en cours",
        description: "Synchronisation des rôles utilisateurs...",
      });

      const { data, error } = await supabase.functions.invoke('synchronize-user-roles');
      
      if (error) {
        console.error("Erreur lors de la synchronisation:", error);
        toast({
          title: "Erreur",
          description: "Impossible de synchroniser les rôles utilisateurs",
          variant: "destructive",
        });
        return false;
      }

      console.log("Résultat de la synchronisation:", data);
      toast({
        title: "Synchronisation réussie",
        description: data.message || "Les rôles utilisateurs ont été synchronisés",
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

  return {
    loading,
    activateUserRolesSync
  };
}
