
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import * as jose from "https://esm.sh/jose@4.14.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-default-jwt-secret-for-development';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    // Extract user_id from token
    const userId = payload.sub;
    if (!userId) {
      throw new Error('Token does not contain a valid user ID');
    }

    // Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userExists) {
      throw new Error('User not found');
    }

    console.log(`Fetching loans for user: ${userId}`);

    // Query loans data
    const { data: loans, error } = await supabase
      .from('sfd_loans')
      .select(`
        id,
        amount,
        duration_months,
        interest_rate,
        monthly_payment,
        purpose,
        status,
        created_at,
        approved_at,
        disbursed_at,
        last_payment_date,
        next_payment_date,
        sfd_id,
        client_id,
        client:client_id(full_name),
        sfd:sfd_id(name, region)
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Log successful request
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'fetch_user_loans',
      category: 'data_access',
      severity: 'info',
      status: 'success',
      details: { endpoint: '/api/user/loans' },
      target_resource: `user:${userId}:loans`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: loans 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in user-loans function:', error);

    // Determine appropriate error status
    let status = 500;
    if (error.message.includes('Authorization') || error.message.includes('Token')) {
      status = 401;
    } else if (error.message.includes('User not found')) {
      status = 404;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
