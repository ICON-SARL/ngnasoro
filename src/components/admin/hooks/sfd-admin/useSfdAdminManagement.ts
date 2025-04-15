
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRolesSynchronization } from './useRolesSynchronization';

export function useSfdAdminManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { synchronizeRoles } = useRolesSynchronization();

  const createSfdAdmin = async (email: string, sfdId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await supabase.functions.invoke('create-sfd-admin', {
        body: { email, sfdId }
      });

      if (apiError) {
        setError(apiError.message);
        throw apiError;
      }

      if (data?.error) {
        setError(data.error);
        throw new Error(data.error);
      }

      // Synchronize roles after creating admin
      await synchronizeRoles();

      toast({
        title: "Administrateur SFD créé",
        description: "L'administrateur SFD a été créé avec succès"
      });
      
      return true;
    } catch (err: any) {
      console.error('Error creating SFD admin:', err);
      
      const errorMessage = err.message || "Impossible de créer l'administrateur SFD";
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error, // Now we properly expose the error state
    createSfdAdmin
  };
}
