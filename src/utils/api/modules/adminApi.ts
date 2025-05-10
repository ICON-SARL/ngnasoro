
import { supabase } from '@/integrations/supabase/client';
import { AssociateSfdParams, AssociateSfdResult } from '@/hooks/auth/types';

export const adminApi = {
  async associateSfdWithUser(params: AssociateSfdParams): Promise<AssociateSfdResult> {
    try {
      const { userId, sfdId, isDefault = false, makeDefault = false } = params;
      
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error checking user:', userError);
        return { success: false, error: 'Utilisateur introuvable' };
      }
      
      // Check if SFD exists
      const { data: sfdData, error: sfdError } = await supabase
        .from('sfds')
        .select('id')
        .eq('id', sfdId)
        .single();
        
      if (sfdError) {
        console.error('Error checking SFD:', sfdError);
        return { success: false, error: 'SFD introuvable' };
      }
      
      // Create or update user-sfd association
      const { data: userSfd, error: associationError } = await supabase
        .from('user_sfds')
        .upsert({
          user_id: userId,
          sfd_id: sfdId,
          is_default: isDefault || makeDefault
        })
        .select()
        .single();
        
      if (associationError) {
        console.error('Error creating user-SFD association:', associationError);
        return { success: false, error: "Impossible d'associer l'utilisateur à la SFD" };
      }
      
      // If makeDefault is true, update all other associations to not be default
      if (makeDefault) {
        await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', userId)
          .neq('sfd_id', sfdId);
      }
      
      return { success: true, userSfd };
    } catch (error: any) {
      console.error('Error in associateSfdWithUser:', error);
      return { success: false, error: error.message };
    }
  }
};
