
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sfd-id, x-sfd-token, x-transaction-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Active transactions store (in memory for this example)
// In a production environment, this would be persisted in a database
const activeTransactions = new Map();

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

    // Parse the URL to extract SFD ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Check for transaction operations
    if (pathParts.includes('transaction')) {
      return await handleTransactionOperation(req, supabase, pathParts, corsHeaders);
    }
    
    // Check if the path follows the pattern /sfd-clients/api/sfd/{sfd_id}/clients
    const apiIndex = pathParts.findIndex(part => part === 'api');
    if (apiIndex === -1 || pathParts[apiIndex + 1] !== 'sfd' || !pathParts[apiIndex + 2]) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid API path. Expected /api/sfd/{sfd_id}/clients' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const sfdId = pathParts[apiIndex + 2];
    console.log('Accessing clients for SFD ID:', sfdId);
    
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Verify the user has access to this SFD
    const { data: userSfds, error: sfdError } = await supabase
      .from('user_sfds')
      .select('*')
      .eq('user_id', user.id)
      .eq('sfd_id', sfdId);
      
    if (sfdError || !userSfds || userSfds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'You do not have access to this SFD' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process based on HTTP method
    if (req.method === 'GET') {
      // Get clients for the specified SFD
      const { data: clients, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
        
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: clientsError.message || 'Failed to fetch clients' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Log the access for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'view_sfd_clients',
        category: 'DATA_ACCESS',
        severity: 'info',
        status: 'success',
        target_resource: `sfd:${sfdId}/clients`,
        details: {
          sfd_id: sfdId,
          client_count: clients?.length || 0,
          timestamp: new Date().toISOString()
        }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: clients || [] 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    else if (req.method === 'POST') {
      // Create a new client for this SFD
      const clientData = await req.json();
      
      // Ensure the client is created for the specified SFD
      clientData.sfd_id = sfdId;
      
      const { data: newClient, error: createError } = await supabase
        .from('sfd_clients')
        .insert(clientData)
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating client:', createError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: createError.message || 'Failed to create client' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Log the client creation for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'create_sfd_client',
        category: 'DATA_MODIFICATION',
        severity: 'info',
        status: 'success',
        target_resource: `sfd:${sfdId}/clients/${newClient.id}`,
        details: {
          sfd_id: sfdId,
          client_id: newClient.id,
          client_name: newClient.full_name,
          timestamp: new Date().toISOString()
        }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: newClient 
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Method ${req.method} not supported` 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
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

// Transaction operation handler
async function handleTransactionOperation(req, supabase, pathParts, corsHeaders) {
  const transactionOperation = pathParts[pathParts.indexOf('transaction') + 1];
  const data = await req.json().catch(() => ({}));
  
  switch (transactionOperation) {
    case 'begin':
      // Start a new transaction
      const transactionId = crypto.randomUUID();
      activeTransactions.set(transactionId, {
        status: 'active',
        operations: [],
        createdAt: new Date().toISOString()
      });
      
      console.log(`Transaction started: ${transactionId}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactionId,
          message: 'Transaction started' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    case 'commit':
      // Commit a transaction
      if (!data.transactionId || !activeTransactions.has(data.transactionId)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Invalid transaction ID' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const transaction = activeTransactions.get(data.transactionId);
      
      // In a real implementation, we would execute all operations in a database transaction
      // For this example, we'll simulate successful commit
      console.log(`Committing transaction: ${data.transactionId} with ${transaction.operations.length} operations`);
      
      activeTransactions.delete(data.transactionId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction committed' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    case 'rollback':
      // Rollback a transaction
      if (!data.transactionId || !activeTransactions.has(data.transactionId)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Invalid transaction ID' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log(`Rolling back transaction: ${data.transactionId}`);
      activeTransactions.delete(data.transactionId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction rolled back' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    default:
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid transaction operation' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
  }
}
