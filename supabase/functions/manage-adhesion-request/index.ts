
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
    if (action === 'approve') {
      // Create SFD client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: adhesionRequest.user_id,
          sfd_id: adhesionRequest.sfd_id,
          full_name: adhesionRequest.full_name,
          email: adhesionRequest.email,
          phone: adhesionRequest.phone,
          address: adhesionRequest.address,
          status: 'validated',
          validated_by: adminId,
          validated_at: new Date().toISOString(),
          notes: notes || null
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

      // Create user-SFD association
      const { error: assocError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: adhesionRequest.user_id,
          sfd_id: adhesionRequest.sfd_id,
          is_default: false
        })
        .select();

      if (assocError) {
        console.error('Error creating user-SFD association:', assocError);
        // Continue anyway, this is not critical
      }

      // Create account for the client
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: adhesionRequest.user_id,
          balance: 0,
          currency: 'FCFA',
          sfd_id: adhesionRequest.sfd_id
        });

      if (accountError) {
        console.error('Error creating client account:', accountError);
        // Continue anyway, this is not critical
      }

      // Send notification to the user
      const { error: notifError } = await supabase
        .from('admin_notifications')
        .insert({
          title: 'Demande d\'adhésion approuvée',
          message: `Votre demande d'adhésion a été approuvée. Bienvenue!`,
          type: 'adhesion_approved',
          recipient_id: adhesionRequest.user_id,
          sender_id: adminId,
          action_link: '/mobile-flow/sfd-accounts'
        });

      if (notifError) {
        console.error('Error sending notification to user:', notifError);
        // Continue anyway, this is not critical
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `La demande d'adhésion a été approuvée.`,
          clientId: client.id,
          status: 'approved'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'reject') {
      // Send notification to the user
      const { error: notifError } = await supabase
        .from('admin_notifications')
        .insert({
          title: 'Demande d\'adhésion rejetée',
          message: notes ? `Votre demande d'adhésion a été rejetée: ${notes}` : 'Votre demande d\'adhésion a été rejetée.',
          type: 'adhesion_rejected',
          recipient_id: adhesionRequest.user_id,
          sender_id: adminId
        });

      if (notifError) {
        console.error('Error sending notification to user:', notifError);
        // Continue anyway, this is not critical
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `La demande d'adhésion a été rejetée.`,
          status: 'rejected'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `La demande d'adhésion a été traitée.`,
        status: newStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
