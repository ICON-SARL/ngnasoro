
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { sfdId } = await req.json();

    if (!sfdId) {
      throw new Error('SFD ID is required');
    }

    // Verify SFD exists and is active
    const { data: sfd, error: sfdError } = await supabaseClient
      .from('sfds')
      .select('id, name, status')
      .eq('id', sfdId)
      .single();

    if (sfdError) throw sfdError;

    if (!sfd) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'SFD not found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    if (sfd.status !== 'active') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'SFD is not active' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Test connection by checking if we can access the SFD accounts
    const { error: accountsError } = await supabaseClient
      .from('sfd_accounts')
      .select('id')
      .eq('sfd_id', sfdId)
      .limit(1);

    if (accountsError) throw accountsError;

    // If we get here, connection is successful
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Connection successful',
        sfd: {
          id: sfd.id,
          name: sfd.name,
          status: sfd.status
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error testing SFD connection:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
