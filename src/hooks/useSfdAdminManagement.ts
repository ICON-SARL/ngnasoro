
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRolesSynchronization } from './useRolesSynchronization';

export function useSfdAdminManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { synchronizeRoles } = useRolesSynchronization();

  const createSfdAdmin = async (email: string, sfdId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
        body: { email, sfdId }
      });

      if (error) throw error;

      // Synchronize roles after creating admin
      await synchronizeRoles();

      toast({
        title: "Administrateur SFD créé",
        description: "L'administrateur SFD a été créé avec succès"
      });
      
      return true;
    } catch (err) {
      console.error('Error creating SFD admin:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'administrateur SFD",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createSfdAdmin
  };
}
