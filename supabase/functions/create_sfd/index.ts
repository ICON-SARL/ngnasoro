
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
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
    const body = await req.json();
    const sfd_data = body.sfd_data;
    const admin_id = body.admin_id;
    
    console.log("Request received for SFD creation:", { sfd_data, admin_id });
    
    if (!sfd_data || !sfd_data.name || !sfd_data.code) {
      console.error("Missing required SFD data (name, code)");
      return new Response(
        JSON.stringify({ error: "Missing required SFD data (name, code)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifier les colonnes existantes dans la table sfds
    const { data: tableInfo, error: tableError } = await supabase
      .from('sfds')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error("Error checking SFD table structure:", tableError);
      return new Response(
        JSON.stringify({ error: `Error checking SFD table structure: ${tableError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extraire uniquement les champs qui existent réellement dans la table
    const cleanedSfdData = {
      name: sfd_data.name,
      code: sfd_data.code,
      region: sfd_data.region || null,
      status: sfd_data.status || 'active',
      logo_url: sfd_data.logo_url || null,
      phone: sfd_data.phone || null
    };
    
    console.log("Creating new SFD with cleaned data:", cleanedSfdData);
    
    // 1. Insert the SFD data
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .insert(cleanedSfdData)
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
    
    // Success response with proper headers to prevent caching issues
    return new Response(
      JSON.stringify(sfdData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json"
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
