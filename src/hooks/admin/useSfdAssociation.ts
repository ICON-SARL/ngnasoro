
import { useState } from 'react';
import { adminApi } from '@/utils/api/modules/adminApi';
import { useToast } from '@/hooks/use-toast';
import { AssociateSfdParams, UserSfdAssociation } from '@/hooks/auth/types';

export function useSfdAssociation() {
  const [isLoading, setIsLoading] = useState(false);
  const [userSfds, setUserSfds] = useState<UserSfdAssociation[]>([]);
  const { toast } = useToast();

  const fetchUserSfds = async (userId: string) => {
    setIsLoading(true);
    try {
      const associations = await adminApi.getUserSfdAssociations(userId);
      // Ensure we're transforming the data to match UserSfdAssociation type
      const transformedAssociations: UserSfdAssociation[] = associations.map((assoc: any) => ({
        id: assoc.id,
        user_id: assoc.user_id,
        sfd_id: assoc.sfd_id,
        is_default: assoc.is_default,
        sfds: {
          id: assoc.sfds.id,
          name: assoc.sfds.name,
          code: assoc.sfds.code || '',
          region: assoc.sfds.region,
          status: assoc.sfds.status || 'active'
        }
      }));
      
      setUserSfds(transformedAssociations);
      return transformedAssociations;
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
    try {
      const response = await adminApi.associateUserWithSfd(params);
      return response;
    } catch (error) {
      console.error('Error associating with SFD:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'associer à un SFD',
        variant: 'destructive',
      });
      return null;
    }
  };

  const removeAssociation = async (userId: string) => {
    try {
      const response = await adminApi.removeUserSfdAssociation(userId);
      return response;
    } catch (error) {
      console.error('Error removing association:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'association',
        variant: 'destructive',
      });
      return null;
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
