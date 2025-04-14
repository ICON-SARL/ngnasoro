
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
      
      // 1. Vérifier que l'admin existe
      const { data: adminExists, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', adminId)
        .single();
        
      if (adminError || !adminExists) {
        throw new Error("Administrateur non trouvé");
      }
      
      // 2. Vérifier que la SFD existe
      const { data: sfdExists, error: sfdError } = await supabase
        .from('sfds')
        .select('id')
        .eq('id', sfdId)
        .single();
        
      if (sfdError || !sfdExists) {
        throw new Error("SFD non trouvée");
      }
      
      // 3. Si makeDefault est true, mettre à jour les autres associations pour cet admin
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
      
      // 4. Créer l'association
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
