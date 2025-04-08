
import { supabase } from "@/integrations/supabase/client";
import { AssociateSfdParams, AssociateSfdResult } from "@/hooks/auth/types";

export const adminApi = {
  // Associate a user with an SFD
  associateUserWithSfd: async (params: AssociateSfdParams): Promise<AssociateSfdResult> => {
    try {
      // Check if association already exists
      const { data: existingAssoc, error: checkError } = await supabase
        .from('user_sfds')
        .select('*')
        .eq('user_id', params.userId)
        .eq('sfd_id', params.sfdId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing association:', checkError);
        return { success: false, error: checkError.message };
      }
      
      if (existingAssoc) {
        // Association already exists, update is_default if needed
        if (params.makeDefault) {
          // First, set all associations to false
          const { error: updateAllError } = await supabase
            .from('user_sfds')
            .update({ is_default: false })
            .eq('user_id', params.userId);
            
          if (updateAllError) {
            console.error('Error resetting default SFDs:', updateAllError);
            return { success: false, error: updateAllError.message };
          }
          
          // Then set this one to true
          const { data, error } = await supabase
            .from('user_sfds')
            .update({ is_default: true })
            .eq('id', existingAssoc.id)
            .select()
            .single();
            
          if (error) {
            console.error('Error updating SFD association:', error);
            return { success: false, error: error.message };
          }
          
          return { success: true, userSfd: data };
        }
        
        return { success: true, userSfd: existingAssoc };
      }
      
      // Create new association
      if (params.makeDefault) {
        // First, set all associations to false
        const { error: updateAllError } = await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', params.userId);
          
        if (updateAllError) {
          console.error('Error resetting default SFDs:', updateAllError);
          return { success: false, error: updateAllError.message };
        }
      }
      
      // Insert the new association
      const { data, error } = await supabase
        .from('user_sfds')
        .insert({
          user_id: params.userId,
          sfd_id: params.sfdId,
          is_default: params.makeDefault || false
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating SFD association:', error);
        return { success: false, error: error.message };
      }
      
      // Also update the user metadata to include sfd_id for the role to be properly set
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        params.userId,
        {
          app_metadata: {
            sfd_id: params.sfdId,
            role: 'sfd_admin'
          }
        }
      );
      
      if (updateError) {
        console.error('Error updating user app_metadata:', updateError);
        // Continue anyway as the association is created
      }
      
      return { success: true, userSfd: data };
    } catch (error: any) {
      console.error('Error associating user with SFD:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Remove an SFD association
  removeUserSfdAssociation: async (userId: string, sfdId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('user_sfds')
        .delete()
        .eq('user_id', userId)
        .eq('sfd_id', sfdId);
        
      if (error) {
        console.error('Error removing SFD association:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error removing SFD association:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get SFDs associated with a user
  getUserSfdAssociations: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id(id, name, code, region, logo_url)
        `)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user SFD associations:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserSfdAssociations:', error);
      return [];
    }
  }
};
