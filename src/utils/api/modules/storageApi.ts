
import { supabase } from "@/integrations/supabase/client";

export const storageApi = {
  /**
   * Upload file to storage
   * @param bucket - Storage bucket name
   * @param path - File path within the bucket
   * @param file - File to upload
   * @returns The uploaded file data
   */
  uploadFile: async (bucket: string, path: string, file: File) => {
    try {
      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in uploadFile:", error);
      throw error;
    }
  },

  /**
   * Get public URL for a file
   * @param bucket - Storage bucket name
   * @param path - File path within the bucket
   * @returns The public URL for the file
   */
  getFileUrl: (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};
