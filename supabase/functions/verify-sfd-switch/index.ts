
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface VerificationRequest {
  userId: string;
  sfdId: string;
  verificationCode?: string;
  action: 'initiate' | 'verify';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Extract authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get request body
    const requestData: VerificationRequest = await req.json();
    
    if (requestData.action === 'initiate') {
      // Check if user has access to this SFD
      const { data: userSfd, error: userSfdError } = await supabase
        .from('user_sfds')
        .select('*')
        .eq('user_id', requestData.userId)
        .eq('sfd_id', requestData.sfdId)
        .single();
      
      if (userSfdError || !userSfd) {
        // If user doesn't have access to this SFD yet, check if there's a pending request
        const { data: pendingClient, error: clientError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('user_id', requestData.userId)
          .eq('sfd_id', requestData.sfdId)
          .eq('status', 'pending')
          .single();
          
        // If there's no pending request either, deny access
        if (clientError || !pendingClient) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Vous n'avez pas accès à cette SFD ou votre demande est encore en attente de validation" 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
        
        // If there's a pending request, inform the user
        return new Response(
          JSON.stringify({ 
            success: false, 
            requiresApproval: true,
            message: "Votre demande d'accès à cette SFD est en cours de traitement" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      
      // In a real implementation, we would:
      // 1. Generate a verification code
      // 2. Store it in a database table with an expiry time
      // 3. Send the code to the user via SMS or email
      
      // For this demo, we'll generate a code but won't send it
      // In a real app, you'd use a service like Twilio or SendGrid
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationId = crypto.randomUUID();
      
      // For demo purposes, we'll return the code directly
      // In a real app, you'd never do this - you'd send it to the user's phone or email
      return new Response(
        JSON.stringify({ 
          success: true, 
          requiresVerification: true,
          verificationId,
          verificationCode, // In a real app, you'd never return this
          message: "Code de vérification envoyé" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (requestData.action === 'verify') {
      // In a real implementation, we would:
      // 1. Check if the verification code matches the one stored in the database
      // 2. Check if the code has expired
      // 3. Mark the code as used
      
      // For this demo, we'll assume all verification codes are valid
      // In a real app, you'd verify against a stored code
      
      // Update the user's SFD in auth metadata
      // This is typically done client-side, but for completeness we show it here
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Vérification réussie" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Action non reconnue" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error processing SFD verification:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
