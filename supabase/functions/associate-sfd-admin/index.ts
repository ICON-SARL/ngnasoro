
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
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the service key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { adminId, sfdId, makeDefault } = await req.json();
    
    if (!adminId || !sfdId) {
      return new Response(
        JSON.stringify({ error: "Admin ID and SFD ID are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Associating admin ${adminId} with SFD ${sfdId} (default: ${makeDefault})`);
    
    // Verify that the SFD exists
    const { data: sfd, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', sfdId)
      .single();
      
    if (sfdError) {
      console.error('Error checking SFD:', sfdError);
      return new Response(
        JSON.stringify({ error: `Error checking SFD: ${sfdError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!sfd) {
      return new Response(
        JSON.stringify({ error: `SFD with ID ${sfdId} not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify that the admin exists
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('id', adminId)
      .single();
      
    if (adminError) {
      console.error('Error checking admin:', adminError);
      return new Response(
        JSON.stringify({ error: `Error checking admin: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!admin) {
      return new Response(
        JSON.stringify({ error: `Admin with ID ${adminId} not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the association already exists
    const { data: existingAssoc, error: checkError } = await supabase
      .from('user_sfds')
      .select('id, is_default')
      .eq('user_id', adminId)
      .eq('sfd_id', sfdId);
      
    if (checkError) {
      console.error('Error checking existing association:', checkError);
      return new Response(
        JSON.stringify({ error: `Error checking existing association: ${checkError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let result;
    
    if (existingAssoc && existingAssoc.length > 0) {
      // Association already exists, update default status if needed
      console.log(`Association already exists with ID ${existingAssoc[0].id}`);
      
      if (makeDefault && !existingAssoc[0].is_default) {
        // First, reset all other associations to non-default
        const { error: resetError } = await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', adminId)
          .neq('id', existingAssoc[0].id);
          
        if (resetError) {
          console.error('Error resetting other associations:', resetError);
        }
        
        // Then set this one as default
        const { data: updated, error: updateError } = await supabase
          .from('user_sfds')
          .update({ is_default: true })
          .eq('id', existingAssoc[0].id)
          .select();
          
        if (updateError) {
          console.error('Error updating association:', updateError);
          return new Response(
            JSON.stringify({ error: `Error updating association: ${updateError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        result = { 
          action: 'updated', 
          association: updated?.[0] || existingAssoc[0],
          message: 'Association set as default'
        };
      } else {
        result = { 
          action: 'unchanged', 
          association: existingAssoc[0],
          message: 'Association already exists'
        };
      }
    } else {
      // Create new association
      
      // If makeDefault is true, reset all existing associations first
      if (makeDefault) {
        const { error: resetError } = await supabase
          .from('user_sfds')
          .update({ is_default: false })
          .eq('user_id', adminId);
          
        if (resetError) {
          console.error('Error resetting other associations:', resetError);
        }
      }
      
      // Insert the new association
      const { data: newAssoc, error: insertError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: adminId,
          sfd_id: sfdId,
          is_default: makeDefault
        })
        .select();
        
      if (insertError) {
        console.error('Error creating association:', insertError);
        return new Response(
          JSON.stringify({ error: `Error creating association: ${insertError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      result = { 
        action: 'created', 
        association: newAssoc?.[0],
        message: 'New association created'
      };
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
