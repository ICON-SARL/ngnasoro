
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { sfdData, adminData, accounts } = await req.json();

    console.log("Received request for SFD creation:", JSON.stringify({
      sfdName: sfdData?.name,
      createAdmin: !!adminData,
      accountTypes: accounts?.types || ['operation', 'remboursement', 'epargne']
    }));

    // 1. Create the SFD with admin and default accounts using our database function
    const { data: sfdResult, error: sfdError } = await supabase.rpc(
      'create_sfd_with_admin_and_accounts',
      {
        sfd_data: sfdData,
        admin_data: adminData,
        account_types: accounts?.types || ['operation', 'remboursement', 'epargne']
      }
    );

    if (sfdError) {
      console.error("Error creating SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `Error creating SFD: ${sfdError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: sfdResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
