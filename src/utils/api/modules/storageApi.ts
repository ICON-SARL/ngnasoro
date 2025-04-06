
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";

/**
 * File storage management methods
 */
export const storageApi = {
  /**
   * Upload a file to storage
   */
  async uploadFile(bucket: string, path: string, file: File) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  
  /**
   * Get public URL for a file
   */
  getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};
