
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

    // Parse request body
    const { sfd_data, admin_id } = await req.json();
    
    if (!sfd_data || !sfd_data.name || !sfd_data.code) {
      return new Response(
        JSON.stringify({ error: "Missing required SFD data (name, code)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating new SFD:", sfd_data);
    
    // 1. Insert the SFD data
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .insert(sfd_data)
      .select()
      .single();
    
    if (sfdError) {
      console.error("Error creating SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `Error creating SFD: ${sfdError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("SFD created successfully:", sfdData);
    
    // 2. Create initial SFD stats
    const { error: statsError } = await supabase
      .from('sfd_stats')
      .insert({
        sfd_id: sfdData.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0
      });
    
    if (statsError) {
      console.warn("Error creating initial SFD stats:", statsError);
      // Not critical, continue
    } else {
      console.log("Initial SFD stats created");
    }
    
    // 3. If admin_id is provided, associate the admin with the SFD
    if (admin_id) {
      const { error: userSfdError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: admin_id,
          sfd_id: sfdData.id,
          is_default: true
        });
        
      if (userSfdError) {
        console.warn("Error associating admin with SFD:", userSfdError);
        // Not critical, continue
      } else {
        console.log(`Admin ${admin_id} associated with SFD ${sfdData.id}`);
      }
    }
    
    // Success response with proper headers
    return new Response(
      JSON.stringify(sfdData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        } 
      }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Error creating SFD: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
