
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserSfdAssociation {
  id: string;
  user_id: string;
  sfd_id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code: string;
    region?: string;
    status: string;
  };
}

interface AssociationParams {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
}

export function useSfdAssociation() {
  const [isLoading, setIsLoading] = useState(false);
  const [userSfds, setUserSfds] = useState<UserSfdAssociation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Récupérer les SFD associées à un utilisateur
  const fetchUserSfds = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          user_id,
          sfd_id,
          is_default,
          sfds:sfd_id (
            id,
            name,
            code,
            region,
            status
          )
        `)
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      setUserSfds(data || []);
      return data;
    } catch (err: any) {
      console.error('Erreur lors de la récupération des SFDs:', err);
      setError(err.message);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les SFDs associées',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Associer un utilisateur à une SFD
  const associateWithSfd = async ({ userId, sfdId, makeDefault = false }: AssociationParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Si c'est la SFD par défaut, mettre à jour toutes les associations existantes
      if (makeDefault) {
        const { error: updateError } = await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Erreur lors de la mise à jour des SFDs existantes:', updateError);
          // Continuer quand même
        }
      }
      
      // Créer la nouvelle association
      const { error: insertError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          is_default: makeDefault
        });
        
      if (insertError) {
        throw insertError;
      }
      
      // Rafraîchir les données
      await fetchUserSfds(userId);
      
      // Invalider les requêtes pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: 'Association réussie',
        description: 'L\'utilisateur a été associé à la SFD avec succès',
      });
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'association:', err);
      setError(err.message);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'associer l\'utilisateur à la SFD',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Supprimer une association
  const removeAssociation = async (userId: string, sfdId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('user_sfds')
        .delete()
        .eq('user_id', userId)
        .eq('sfd_id', sfdId);
        
      if (error) {
        throw error;
      }
      
      // Rafraîchir les données
      await fetchUserSfds(userId);
      
      // Invalider les requêtes pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: 'Association supprimée',
        description: 'L\'association a été supprimée avec succès',
      });
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'association:', err);
      setError(err.message);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'association',
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
    error,
    fetchUserSfds,
    associateWithSfd,
    removeAssociation
  };
}
