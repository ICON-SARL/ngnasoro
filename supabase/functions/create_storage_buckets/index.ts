
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting storage buckets creation...");
    
    // Define buckets to create
    const buckets = [
      { name: "logos", public: true, fileSize: 5242880 }, // 5MB
      { name: "documents", public: false, fileSize: 10485760 }, // 10MB
      { name: "profile-photos", public: true, fileSize: 5242880 }, // 5MB
      { name: "loan-documents", public: false, fileSize: 20971520 } // 20MB
    ];
    
    const results = [];
    
    // Create each bucket if it doesn't exist
    for (const bucket of buckets) {
      try {
        // Check if bucket exists
        const { data: existingBucket, error: checkError } = await supabase
          .storage
          .getBucket(bucket.name);
          
        if (checkError && checkError.message !== "The resource was not found") {
          console.error(`Error checking bucket ${bucket.name}:`, checkError);
          results.push({ bucket: bucket.name, status: 'error', message: checkError.message });
          continue;
        }
        
        // If bucket exists, skip
        if (existingBucket) {
          console.log(`Bucket ${bucket.name} already exists`);
          results.push({ bucket: bucket.name, status: 'already_exists' });
          continue;
        }
        
        // Create the bucket
        const { data, error } = await supabase
          .storage
          .createBucket(bucket.name, {
            public: bucket.public,
            fileSizeLimit: bucket.fileSize,
            allowedMimeTypes: bucket.public 
              ? ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'] 
              : undefined
          });
          
        if (error) {
          console.error(`Error creating bucket ${bucket.name}:`, error);
          results.push({ bucket: bucket.name, status: 'error', message: error.message });
        } else {
          console.log(`Created bucket ${bucket.name}`);
          results.push({ bucket: bucket.name, status: 'created' });
        }
      } catch (bucketError) {
        console.error(`Exception creating bucket ${bucket.name}:`, bucketError);
        results.push({ bucket: bucket.name, status: 'error', message: bucketError.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: `Error creating storage buckets: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
