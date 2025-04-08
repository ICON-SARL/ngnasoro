
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

    // Ensure storage buckets exist before proceeding
    try {
      await supabase.functions.invoke('create_storage_buckets');
    } catch (error) {
      console.warn("Warning: Failed to ensure storage buckets exist:", error);
      // Continue anyway as this is not critical
    }

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

    // Vérifier l'existence d'une SFD avec le même code
    const { data: existingSfd, error: checkError } = await supabase
      .from('sfds')
      .select('id, code')
      .eq('code', sfd_data.code)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing SFD:", checkError);
      return new Response(
        JSON.stringify({ error: `Error checking existing SFD: ${checkError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (existingSfd) {
      console.error(`SFD with code ${sfd_data.code} already exists`);
      return new Response(
        JSON.stringify({ error: `Une SFD avec le code ${sfd_data.code} existe déjà` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the table structure to make sure we only include valid columns
    const { data: columnsData, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'sfds' });
      
    if (columnsError) {
      console.warn("Could not get table structure, using hardcoded fields:", columnsError);
    }
    
    // Extraire uniquement les champs qui existent dans la table
    let validColumns = ['name', 'code', 'region', 'status', 'logo_url', 'phone', 'subsidy_balance'];
    if (columnsData && Array.isArray(columnsData)) {
      validColumns = columnsData.map(col => col.column_name);
    }
    
    // Add legal_document_url if not in the list but we need it
    if (!validColumns.includes('legal_document_url')) {
      validColumns.push('legal_document_url');
    }
    
    // Filter to valid columns only
    const cleanedSfdData = Object.fromEntries(
      Object.entries(sfd_data).filter(([key]) => validColumns.includes(key))
    );
    
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
      JSON.stringify({
        success: true,
        data: sfdData
      }),
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
