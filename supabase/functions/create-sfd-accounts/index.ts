
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sfd-id, x-sfd-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

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

    // Parse request body
    const { sfdData, adminData, accounts } = await req.json();

    if (!sfdData || !adminData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'SFD data and admin data are required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the SFD data
    if (!sfdData.name || !sfdData.code) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'SFD name and code are required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the admin data
    if (!adminData.email || !adminData.password || !adminData.full_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Admin email, password, and full name are required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get account types (default to operations and repayment if not provided)
    const accountTypes = accounts?.types || ['operation', 'remboursement'];

    // Call the database function to create SFD with admin and accounts
    const { data, error } = await supabase.rpc('create_sfd_with_admin_and_accounts', {
      sfd_data: sfdData,
      admin_data: adminData,
      account_types: accountTypes
    });

    if (error) {
      console.error('Error creating SFD with accounts:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: error.message || 'Failed to create SFD with accounts',
          details: error
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error handling request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
