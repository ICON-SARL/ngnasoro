
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";

/**
 * User profile management methods
 */
export const profileApi = {
  /**
   * Get user profile data
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  
  /**
   * Update user profile data
   */
  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }
};
