
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    const { adhesionId, userId, notes } = body;
    
    if (!adhesionId || !userId) {
      throw new Error("Missing required parameters");
    }
    
    console.log(`Processing adhesion approval: ${adhesionId}`);
    
    // Get the adhesion request details
    const { data: adhesion, error: getError } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('id', adhesionId)
      .single();
    
    if (getError) {
      console.error('Error fetching adhesion request:', getError);
      throw getError;
    }
    
    // Begin transaction by updating the status of the adhesion request
    // 1. Update adhesion request to 'approved'
    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({
        status: 'approved',
        processed_by: userId,
        processed_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', adhesionId);
    
    if (updateError) {
      console.error('Error updating adhesion request:', updateError);
      throw updateError;
    }
    
    // 2. Create an SFD client
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .insert({
        full_name: adhesion.full_name,
        email: adhesion.email,
        phone: adhesion.phone,
        address: adhesion.address,
        id_number: adhesion.id_number,
        id_type: adhesion.id_type,
        sfd_id: adhesion.sfd_id,
        user_id: adhesion.user_id,
        status: 'validated',
        validated_by: userId,
        validated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientError) {
      console.error('Error creating client:', clientError);
      throw clientError;
    }
    
    // 3. Create a client account
    if (adhesion.user_id) {
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: adhesion.user_id,
          balance: 0,
          currency: 'FCFA'
        });
      
      if (accountError) {
        console.error('Error creating account:', accountError);
        throw accountError;
      }
    }
    
    // 4. Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'client_adhesion_approved',
        category: 'USER_MANAGEMENT',
        status: 'success',
        severity: 'info',
        target_resource: `client_adhesion_requests/${adhesionId}`,
        details: {
          client_name: adhesion.full_name,
          sfd_id: adhesion.sfd_id
        }
      });
    
    // 5. Create notification for the client
    if (adhesion.user_id) {
      await supabase
        .from('admin_notifications')
        .insert({
          title: 'Adhésion approuvée',
          message: 'Votre demande d\'adhésion a été approuvée. Bienvenue!',
          type: 'adhesion_approved',
          recipient_id: adhesion.user_id,
          sender_id: userId
        });
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Adhesion request approved successfully" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing adhesion approval:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
