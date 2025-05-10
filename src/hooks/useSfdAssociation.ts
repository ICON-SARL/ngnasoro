
import { useState } from 'react';
import { adminApi } from '@/utils/api/modules/adminApi';
import { useToast } from '@/hooks/use-toast';
import { AssociateSfdParams, AssociateSfdResult } from '@/hooks/auth/types';

export function useSfdAssociation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const associateSfd = async (params: AssociateSfdParams): Promise<AssociateSfdResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await adminApi.associateSfdWithUser(params);
      
      if (!result.success) {
        setError(result.error || 'Une erreur est survenue');
        toast({
          title: "Échec de l'association",
          description: result.error || "Impossible d'associer l'utilisateur à la SFD",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Une erreur inattendue s'est produite";
      setError(errorMsg);
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive"
      });
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    associateSfd,
    isLoading,
    error
  };
}
