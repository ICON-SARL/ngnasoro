
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
      
      // Vérifier si la SFD existe réellement
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name')
        .eq('id', sfdId);
      
      if (sfdsError) {
        throw new Error(`Erreur lors de la vérification de la SFD: ${sfdsError.message}`);
      }
      
      if (!sfds || sfds.length === 0) {
        throw new Error(`La SFD avec l'ID ${sfdId} n'existe pas`);
      }
      
      console.log(`SFD trouvée: ${sfds[0].name} (${sfdId})`);
      
      // Vérifier si l'administrateur existe
      const { data: admins, error: adminsError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('id', adminId);
      
      if (adminsError) {
        throw new Error(`Erreur lors de la vérification de l'administrateur: ${adminsError.message}`);
      }
      
      if (!admins || admins.length === 0) {
        throw new Error(`L'administrateur avec l'ID ${adminId} n'existe pas`);
      }
      
      console.log(`Administrateur trouvé: ${admins[0].email} (${adminId})`);
      
      // Vérifier si l'association existe déjà
      const { data: existingAssoc, error: checkError } = await supabase
        .from('user_sfds')
        .select('id, is_default')
        .eq('user_id', adminId)
        .eq('sfd_id', sfdId);
        
      if (checkError) {
        throw new Error(`Erreur lors de la vérification de l'association: ${checkError.message}`);
      }
      
      if (existingAssoc && existingAssoc.length > 0) {
        // Si l'association existe déjà, mettre à jour uniquement le statut par défaut si nécessaire
        if (makeDefault) {
          // D'abord, mettre à jour les autres associations pour cet admin
          const { error: updateError } = await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', adminId)
            .neq('id', existingAssoc[0].id);
            
          if (updateError) {
            console.error("Erreur lors de la mise à jour des associations existantes:", updateError);
          }
          
          // Ensuite, définir cette association comme par défaut si ce n'est pas déjà le cas
          if (!existingAssoc[0].is_default) {
            const { error: setDefaultError } = await supabase
              .from('user_sfds')
              .update({ is_default: true })
              .eq('id', existingAssoc[0].id);
              
            if (setDefaultError) {
              throw new Error(`Erreur lors de la mise à jour du statut par défaut: ${setDefaultError.message}`);
            }
          }
        }
        
        toast({
          title: 'Association existante',
          description: `L'administrateur est déjà associé à cette SFD. ${makeDefault ? 'Définie comme SFD par défaut.' : ''}`
        });
      } else {
        // 4. Si makeDefault est true, mettre à jour les autres associations pour cet admin
        if (makeDefault) {
          const { error: updateError } = await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', adminId);
            
          if (updateError) {
            console.error("Erreur lors de la mise à jour des associations existantes:", updateError);
            // On continue quand même, ce n'est pas critique
          }
        }
        
        // 5. Créer l'association
        const { data, error: insertError } = await supabase
          .from('user_sfds')
          .insert({
            user_id: adminId,
            sfd_id: sfdId,
            is_default: makeDefault
          })
          .select();
          
        if (insertError) {
          throw new Error(`Erreur lors de l'association: ${insertError.message}`);
        }
        
        console.log("Association créée avec succès:", data);
        
        toast({
          title: 'Association réussie',
          description: `L'administrateur a été associé à la SFD avec succès.`
        });
      }

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
