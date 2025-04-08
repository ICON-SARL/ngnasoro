
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requiredBuckets = ['logos', 'documents', 'profiles'];
    const results = [];
    
    for (const bucket of requiredBuckets) {
      // Check if bucket exists
      const { data: existingBucket, error: checkError } = await supabase
        .storage
        .getBucket(bucket);
        
      if (checkError && checkError.message !== 'The resource was not found') {
        console.error(`Error checking bucket ${bucket}:`, checkError);
        results.push({ bucket, status: 'error', message: checkError.message });
        continue;
      }
      
      // Create bucket if it doesn't exist
      if (!existingBucket) {
        const { data, error } = await supabase
          .storage
          .createBucket(bucket, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/*', 'application/pdf']
          });
          
        if (error) {
          console.error(`Error creating bucket ${bucket}:`, error);
          results.push({ bucket, status: 'error', message: error.message });
        } else {
          console.log(`Bucket ${bucket} created successfully`);
          results.push({ bucket, status: 'created' });
          
          // Add public policy to the bucket
          if (bucket === 'logos' || bucket === 'documents') {
            const { error: policyError } = await supabase
              .storage
              .from(bucket)
              .createSignedUrl('test-policy', 10); // Just to test policy creation
              
            if (policyError) {
              console.warn(`Warning: Could not create public policy for ${bucket}`, policyError);
            }
          }
        }
      } else {
        console.log(`Bucket ${bucket} already exists`);
        results.push({ bucket, status: 'exists' });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
