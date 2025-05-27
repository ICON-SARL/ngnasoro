
import { supabase } from '@/integrations/supabase/client';
import { AssociateSfdParams, AssociateSfdResult } from '@/hooks/auth/types';

// Add any missing methods or update them if needed
export const adminApi = {
  // Method to associate a user with an SFD
  associateUserWithSfd: async (params: AssociateSfdParams): Promise<AssociateSfdResult> => {
    try {
      // Check if the association already exists
      const { data: existingAssoc } = await supabase
        .from('user_sfds')
        .select('*')
        .eq('user_id', params.userId)
        .eq('sfd_id', params.sfdId)
        .single();
      
      if (existingAssoc) {
        return {
          success: true,
          data: existingAssoc
        };
      }
      
      // Create the association
      const { data, error } = await supabase
        .from('user_sfds')
        .insert({
          user_id: params.userId,
          sfd_id: params.sfdId,
          is_default: params.isDefault || params.makeDefault || false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error associating user with SFD:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      console.error('Error in associateUserWithSfd:', error);
      return {
        success: false,
        error: error.message || 'Failed to associate user with SFD'
      };
    }
  },
  
  // Method to remove a user-SFD association
  removeUserSfdAssociation: async (userId: string, sfdId: string): Promise<AssociateSfdResult> => {
    try {
      const { error } = await supabase
        .from('user_sfds')
        .delete()
        .eq('user_id', userId)
        .eq('sfd_id', sfdId);
      
      if (error) {
        console.error('Error removing user-SFD association:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error in removeUserSfdAssociation:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove user-SFD association'
      };
    }
  },
  
  // Method to get all SFDs associated with a user
  getUserSfdAssociations: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
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
