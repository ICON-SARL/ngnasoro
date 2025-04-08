
import { supabase } from "@/integrations/supabase/client";

export const storageApi = {
  /**
   * Upload file to storage
   * @param bucket - Storage bucket name
   * @param path - File path within the bucket
   * @param file - File to upload
   * @returns The uploaded file data including URL
   */
  uploadFile: async (bucket: string, path: string, file: File) => {
    try {
      console.log(`Uploading file to ${bucket}/${path}`);
      
      // Ensure bucket exists before upload
      await storageApi.createBucketIfNotExists(bucket, bucket === 'logos');
      
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

      console.log("File uploaded successfully:", data);

      // Get the public URL for the uploaded file
      const url = storageApi.getFileUrl(bucket, data.path);
      
      return {
        path: data.path,
        url: url
      };
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
  },

  /**
   * Check if storage bucket exists
   * @param bucket - Storage bucket name
   * @returns True if the bucket exists
   */
  checkBucketExists: async (bucket: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket);
      if (error) {
        console.log(`Bucket ${bucket} does not exist:`, error);
        return false;
      }
      console.log(`Bucket ${bucket} exists:`, data);
      return !!data;
    } catch (error) {
      console.error(`Error checking if bucket ${bucket} exists:`, error);
      return false;
    }
  },

  /**
   * Create storage bucket if it doesn't exist
   * @param bucket - Storage bucket name
   * @param isPublic - Whether the bucket should be public
   * @returns True if the bucket was created or already exists
   */
  createBucketIfNotExists: async (bucket: string, isPublic: boolean = false): Promise<boolean> => {
    try {
      // First check if bucket exists
      const exists = await storageApi.checkBucketExists(bucket);
      
      if (exists) {
        console.log(`Bucket ${bucket} already exists, no need to create it.`);
        return true;
      }

      console.log(`Creating bucket ${bucket}, public: ${isPublic}...`);

      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(bucket, {
        public: isPublic,
        fileSizeLimit: isPublic ? 5242880 : 10485760, // 5MB for public, 10MB for private
      });

      if (error) {
        console.error(`Error creating bucket ${bucket}:`, error);
        
        // Call the create_storage_buckets edge function as a fallback
        const edgeResult = await supabase.functions.invoke('create_storage_buckets');
        console.log("Called create_storage_buckets edge function:", edgeResult);
        
        // Check if the bucket now exists
        const existsAfterFallback = await storageApi.checkBucketExists(bucket);
        return existsAfterFallback;
      }

      console.log(`Successfully created bucket ${bucket}:`, data);
      return true;
    } catch (error) {
      console.error(`Error in createBucketIfNotExists for ${bucket}:`, error);
      
      // Call the create_storage_buckets edge function as a fallback
      try {
        const edgeResult = await supabase.functions.invoke('create_storage_buckets');
        console.log("Called create_storage_buckets edge function as error fallback:", edgeResult);
        
        // Check if the bucket now exists
        const existsAfterFallback = await storageApi.checkBucketExists(bucket);
        return existsAfterFallback;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return false;
      }
    }
  }
};
