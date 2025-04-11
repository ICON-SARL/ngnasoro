
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) {
      throw new Error('Unauthorized: ' + userError.message)
    }

    // Parse the request body
    const { action, sfdId, clientId, verificationCode } = await req.json()
    
    // Handle different verification actions
    if (action === 'initiate') {
      // Generate a verification code for the client
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expireAt = new Date();
      expireAt.setMinutes(expireAt.getMinutes() + 30); // Code expires in 30 minutes
      
      // Store the verification code
      const { data, error } = await supabaseClient
        .from('sfd_verification_codes')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          code: code,
          expire_at: expireAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) {
        throw new Error('Failed to create verification: ' + error.message);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          verificationId: data.id,
          verificationCode: code, // In a real app, this would be sent via SMS
          expiresAt: expireAt.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'verify') {
      // Verify the code provided by the client
      if (!verificationCode) {
        throw new Error('Verification code is required');
      }
      
      // Check if the code is valid
      const { data: verification, error: verificationError } = await supabaseClient
        .from('sfd_verification_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .eq('code', verificationCode)
        .eq('status', 'pending')
        .gt('expire_at', new Date().toISOString())
        .single();
        
      if (verificationError || !verification) {
        throw new Error('Invalid or expired verification code');
      }
      
      // Mark the verification as used
      await supabaseClient
        .from('sfd_verification_codes')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', verification.id);
      
      // Update the client status if needed
      if (clientId) {
        await supabaseClient
          .from('sfd_clients')
          .update({ 
            status: 'validated',
            validated_at: new Date().toISOString(),
            validated_by: user.id
          })
          .eq('id', clientId);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification successful'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid action'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
