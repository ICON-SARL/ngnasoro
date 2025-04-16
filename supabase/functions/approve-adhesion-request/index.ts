
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

    if (!adhesion) {
      throw new Error("Adhesion request not found");
    }
    
    console.log(`Found adhesion request for user ${adhesion.user_id} to SFD ${adhesion.sfd_id}`);
    
    // Begin transaction steps - we'll use separate steps instead of a transaction
    // because Edge Functions don't support true transactions
    
    // 1. Update adhesion request to 'approved'
    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({
        status: 'approved',
        processed_by: userId,
        processed_at: new Date().toISOString(),
        notes: notes || ''
      })
      .eq('id', adhesionId);
    
    if (updateError) {
      console.error('Error updating adhesion request:', updateError);
      throw updateError;
    }
    
    console.log('Successfully updated adhesion request status to approved');
    
    // 2. Create an SFD client
    const clientData = {
      full_name: adhesion.full_name,
      email: adhesion.email,
      phone: adhesion.phone,
      address: adhesion.address || '',
      id_number: adhesion.id_number || '',
      id_type: adhesion.id_type || 'ID',
      sfd_id: adhesion.sfd_id,
      user_id: adhesion.user_id,
      status: 'validated',
      validated_by: userId,
      validated_at: new Date().toISOString()
    };
    
    console.log('Creating SFD client with data:', clientData);
    
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .insert(clientData)
      .select()
      .single();
    
    if (clientError) {
      console.error('Error creating client:', clientError);
      throw clientError;
    }
    
    console.log('Successfully created SFD client');
    
    // 3. Create a client account - check if user already has an account
    if (adhesion.user_id) {
      console.log(`Checking for existing account for user ${adhesion.user_id}`);
      
      // Check if the user already has an account
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', adhesion.user_id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing account:', checkError);
        // Continue execution, don't throw error here
      }
      
      // Only create account if user doesn't already have one
      if (!existingAccount) {
        console.log(`Creating new account for user ${adhesion.user_id}`);
        
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert({
            user_id: adhesion.user_id,
            balance: 0,
            currency: 'FCFA'
            // Note: We're not including sfd_id here as it seems it doesn't exist in the table schema
          });
        
        if (accountError) {
          console.error('Error creating account:', accountError);
          // Log the error but don't fail the entire process
          console.log('Will continue despite account creation error');
        } else {
          console.log('Successfully created account');
        }
      } else {
        console.log(`User ${adhesion.user_id} already has an account, skipping creation`);
      }
    }
    
    // 4. Create audit log entry
    try {
      console.log('Creating audit log entry');
      
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
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Continue execution, don't throw error here
    }
    
    // 5. Create notification for the client
    try {
      if (adhesion.user_id) {
        console.log(`Creating notification for user ${adhesion.user_id}`);
        
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
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue execution, don't throw error here
    }
    
    console.log('Adhesion request approval completed successfully');
    
    return new Response(
      JSON.stringify({ success: true, message: "Adhesion request approved successfully", client }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing adhesion approval:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error",
        stack: error.stack || "No stack trace available",
        details: "Please check the Edge Function logs for more details" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
