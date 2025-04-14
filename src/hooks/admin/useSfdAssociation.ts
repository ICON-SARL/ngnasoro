
import { useState } from 'react';
import { adminApi } from '@/utils/api/modules/adminApi';
import { useToast } from '@/hooks/use-toast';
import { AssociateSfdParams } from '@/hooks/auth/types';

export function useSfdAssociation() {
  const [isLoading, setIsLoading] = useState(false);
  const [userSfds, setUserSfds] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchUserSfds = async (userId: string) => {
    setIsLoading(true);
    try {
      const associations = await adminApi.getUserSfdAssociations(userId);
      setUserSfds(associations);
      return associations;
    } catch (error) {
      console.error('Error fetching user SFDs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les SFDs associées à cet utilisateur',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const associateWithSfd = async (params: AssociateSfdParams) => {
    setIsLoading(true);
    try {
      const result = await adminApi.associateUserWithSfd(params);
      
      if (result.success) {
        toast({
          title: 'Association réussie',
          description: 'L\'utilisateur a été associé à la SFD avec succès',
        });
        
        // Refresh the list of associations
        await fetchUserSfds(params.userId);
        return true;
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible d\'associer l\'utilisateur à la SFD',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error associating user with SFD:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'association',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAssociation = async (userId: string, sfdId: string) => {
    setIsLoading(true);
    try {
      const result = await adminApi.removeUserSfdAssociation(userId, sfdId);
      
      if (result.success) {
        toast({
          title: 'Association supprimée',
          description: 'L\'association avec la SFD a été supprimée',
        });
        
        // Refresh the list of associations
        await fetchUserSfds(userId);
        return true;
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de supprimer l\'association',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error removing SFD association:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    userSfds,
    fetchUserSfds,
    associateWithSfd,
    removeAssociation
  };
}
