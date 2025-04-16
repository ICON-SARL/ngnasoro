
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
    const { userId, sfdId, adhesionData } = await req.json();
    
    if (!userId || !sfdId) {
      return new Response(
        JSON.stringify({ error: 'User ID and SFD ID are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user profile', details: profileError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get SFD data
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('name')
      .eq('id', sfdId)
      .single();

    if (sfdError) {
      console.error('Error fetching SFD data:', sfdError);
      return new Response(
        JSON.stringify({ error: 'Error fetching SFD data', details: sfdError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if a request already exists
    const { data: existingRequest, error: checkError } = await supabase
      .from('client_adhesion_requests')
      .select('id, status')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .not('status', 'eq', 'rejected')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing requests:', checkError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing requests', details: checkError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // If request exists and is still pending or approved
    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Vous avez déjà une demande ${existingRequest.status === 'pending' ? 'en attente' : 'approuvée'} pour cette SFD.`,
          requestId: existingRequest.id,
          status: existingRequest.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new adhesion request
    const { data: newRequest, error: insertError } = await supabase
      .from('client_adhesion_requests')
      .insert({
        user_id: userId,
        sfd_id: sfdId,
        full_name: profileData.full_name || adhesionData?.full_name || 'Client',
        email: profileData.email || adhesionData?.email,
        phone: adhesionData?.phone,
        address: adhesionData?.address,
        profession: adhesionData?.profession,
        monthly_income: adhesionData?.monthly_income ? parseFloat(adhesionData.monthly_income) : null,
        source_of_income: adhesionData?.source_of_income,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating adhesion request:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error creating adhesion request', details: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create notification for SFD admins
    const { error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Nouvelle demande d\'adhésion',
        message: `${profileData.full_name || 'Un utilisateur'} souhaite adhérer à votre SFD.`,
        type: 'adhesion_request',
        recipient_role: 'sfd_admin',
        sender_id: userId,
        action_link: '/sfd-adhesion-requests'
      });

    if (notifError) {
      console.error('Error sending notification to SFD admin:', notifError);
      // We continue anyway as this is not critical
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Votre demande d'adhésion à ${sfdData.name} a été envoyée avec succès.`,
        requestId: newRequest.id,
        status: 'pending'
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
