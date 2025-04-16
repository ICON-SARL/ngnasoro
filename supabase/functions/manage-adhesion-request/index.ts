
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
        JSON.stringify({ error: 'Error fetching adhesion request', details: fetchError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update the adhesion request status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({ 
        status: newStatus,
        processed_by: adminId,
        processed_at: new Date().toISOString(),
        notes: notes || null,
        rejection_reason: action === 'reject' ? notes : null
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating adhesion request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error updating adhesion request', details: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // If approved, create a client record and account
    let clientId = null;
    if (action === 'approve') {
      // Create SFD client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .insert({
          full_name: adhesionRequest.full_name,
          email: adhesionRequest.email,
          phone: adhesionRequest.phone,
          address: adhesionRequest.address,
          sfd_id: adhesionRequest.sfd_id,
          status: 'active',
          validated_by: adminId,
          validated_at: new Date().toISOString(),
          user_id: adhesionRequest.user_id
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating SFD client:', clientError);
        return new Response(
          JSON.stringify({ error: 'Error creating SFD client', details: clientError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      clientId = client.id;

      // Create user_sfds entry to associate the user with the SFD
      const { error: userSfdError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: adhesionRequest.user_id,
          sfd_id: adhesionRequest.sfd_id,
          is_default: true
        });

      if (userSfdError) {
        console.error('Error creating user_sfds entry:', userSfdError);
        // Continue anyway, as the client was already created
      }
      
      // Create an account for the client
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: adhesionRequest.user_id,
          balance: 0,
          currency: 'FCFA'
        });

      if (accountError) {
        console.error('Error creating account:', accountError);
        // Continue anyway, as the client was already created
      }
      
      // Create notification for the user
      const { error: notifError } = await supabase
        .from('admin_notifications')
        .insert({
          title: 'Demande d\'adhésion approuvée',
          message: 'Votre demande d\'adhésion a été approuvée. Bienvenue!',
          type: 'adhesion_approved',
          recipient_id: adhesionRequest.user_id,
          sender_id: adminId
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
        // Continue anyway, as this is not critical
      }
    } else if (action === 'reject') {
      // Create notification for rejection
      const { error: notifError } = await supabase
        .from('admin_notifications')
        .insert({
          title: 'Demande d\'adhésion refusée',
          message: notes ? `Votre demande a été refusée: ${notes}` : 'Votre demande d\'adhésion a été refusée.',
          type: 'adhesion_rejected',
          recipient_id: adhesionRequest.user_id,
          sender_id: adminId
        });

      if (notifError) {
        console.error('Error creating rejection notification:', notifError);
        // Continue anyway, as this is not critical
      }
    }

    return new Response(
      JSON.stringify({ 
        status: newStatus, 
        clientId,
        message: action === 'approve' 
          ? 'La demande a été approuvée avec succès.' 
          : 'La demande a été rejetée.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
