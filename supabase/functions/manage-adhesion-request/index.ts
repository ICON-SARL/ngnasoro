
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { action, requestId, adminId, notes } = await req.json();
    
    if (!requestId || !adminId || !action) {
      return new Response(
        JSON.stringify({ error: 'Request ID, Admin ID, and action are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the adhesion request data
    const { data: adhesionRequest, error: fetchError } = await supabase
      .from('client_adhesion_requests')
      .select('id, user_id, sfd_id, full_name, email, phone, address, status')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      console.error('Error fetching adhesion request:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error retrieving adhesion request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (action === 'approve') {
      // Update adhesion request status to approved
      const { error: updateError } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: adminId,
          notes: notes
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating adhesion request:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error approving adhesion request' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Create a client record in sfd_clients
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: adhesionRequest.user_id,
          sfd_id: adhesionRequest.sfd_id,
          full_name: adhesionRequest.full_name,
          email: adhesionRequest.email,
          phone: adhesionRequest.phone,
          address: adhesionRequest.address,
          status: 'active',
          validated_at: new Date().toISOString(),
          validated_by: adminId
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client record:', clientError);
        return new Response(
          JSON.stringify({ error: 'Error creating client record' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Adhesion request approved successfully',
          status: 'approved',
          clientId: clientData.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'reject') {
      // Update adhesion request status to rejected
      const { error: updateError } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: adminId,
          notes: notes
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating adhesion request:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error rejecting adhesion request' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Adhesion request rejected successfully',
          status: 'rejected'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be approve or reject' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
