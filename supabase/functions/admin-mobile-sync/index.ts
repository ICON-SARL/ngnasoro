
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to handle pagination and filtering
const buildPaginatedQuery = (supabase, table, queryParams) => {
  const {
    page = 1,
    pageSize = 10,
    startDate,
    endDate,
    status,
    sfdId,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = queryParams;

  // Calculate offset
  const offset = (page - 1) * pageSize;
  
  // Start building the query
  let query = supabase.from(table).select('*', { count: 'exact' });
  
  // Apply filters if provided
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (sfdId) {
    query = query.eq('sfd_id', sfdId);
  }
  
  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);
  
  return query;
}

// API router to handle different endpoints
const handleRequest = async (req, supabase) => {
  const url = new URL(req.url);
  const path = url.pathname.replace('/admin-mobile-sync', '');
  
  // Parse query parameters
  const queryParams = {};
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value;
  }
  
  console.log(`Processing request for path: ${path} with params:`, queryParams);
  
  // Handle different endpoints
  try {
    // 1. Active SFDs endpoint
    if (path === '/sfds') {
      // For SFDs, we'll only apply status filter and always return all active by default
      let query = supabase.from('sfds').select('*');
      
      if (queryParams.status) {
        query = query.eq('status', queryParams.status);
      } else {
        query = query.eq('status', 'active');
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { 
        success: true, 
        data,
        count: data.length
      };
    }
    
    // 2. Subsidy details endpoint
    else if (path === '/subsidies') {
      // For subsidies, we'll apply pagination and filters
      const { data, error, count } = await buildPaginatedQuery(
        supabase, 
        'sfd_subsidies', 
        queryParams
      );
      
      if (error) throw error;
      
      // Get SFD names for the subsidies
      const sfdIds = data.map(subsidy => subsidy.sfd_id);
      
      let sfds = [];
      if (sfdIds.length > 0) {
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name')
          .in('id', sfdIds);
          
        if (sfdsError) throw sfdsError;
        sfds = sfdsData;
      }
      
      // Merge SFD names with subsidies
      const enrichedData = data.map(subsidy => {
        const sfd = sfds.find(s => s.id === subsidy.sfd_id);
        return {
          ...subsidy,
          sfd_name: sfd ? sfd.name : 'Unknown SFD'
        };
      });
      
      return { 
        success: true, 
        data: enrichedData,
        count,
        pagination: {
          page: parseInt(queryParams.page || 1),
          pageSize: parseInt(queryParams.pageSize || 10),
          totalPages: Math.ceil(count / parseInt(queryParams.pageSize || 10)),
          totalCount: count
        }
      };
    }
    
    // 3. Credit/Loan requests status endpoint
    else if (path === '/loans') {
      // Get loans with pagination and filters
      const { data, error, count } = await buildPaginatedQuery(
        supabase, 
        'sfd_loans', 
        queryParams
      );
      
      if (error) throw error;
      
      // Get relevant SFD and client information
      const sfdIds = [...new Set(data.map(loan => loan.sfd_id))];
      const clientIds = [...new Set(data.map(loan => loan.client_id))];
      
      // Get SFD data
      let sfds = [];
      if (sfdIds.length > 0) {
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name')
          .in('id', sfdIds);
          
        if (sfdsError) throw sfdsError;
        sfds = sfdsData;
      }
      
      // Get client data
      let clients = [];
      if (clientIds.length > 0) {
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id, full_name')
          .in('id', clientIds);
          
        if (clientsError) throw clientsError;
        clients = clientsData;
      }
      
      // Enrich the loan data with SFD and client information
      const enrichedData = data.map(loan => {
        const sfd = sfds.find(s => s.id === loan.sfd_id);
        const client = clients.find(c => c.id === loan.client_id);
        
        return {
          ...loan,
          sfd_name: sfd ? sfd.name : 'Unknown SFD',
          client_name: client ? client.full_name : 'Unknown Client'
        };
      });
      
      return { 
        success: true, 
        data: enrichedData,
        count,
        pagination: {
          page: parseInt(queryParams.page || 1),
          pageSize: parseInt(queryParams.pageSize || 10),
          totalPages: Math.ceil(count / parseInt(queryParams.pageSize || 10)),
          totalCount: count
        }
      };
    }
    
    // 4. Handle subsidy requests status endpoint
    else if (path === '/subsidy-requests') {
      // For subsidy requests, we'll apply pagination and filters
      const query = buildPaginatedQuery(
        supabase, 
        'subsidy_requests', 
        queryParams
      ).select(`
        *,
        sfds:sfd_id (id, name)
      `);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Format the response
      const enrichedData = data.map(request => ({
        ...request,
        sfd_name: request.sfds ? request.sfds.name : 'Unknown SFD'
      }));
      
      return { 
        success: true, 
        data: enrichedData,
        count,
        pagination: {
          page: parseInt(queryParams.page || 1),
          pageSize: parseInt(queryParams.pageSize || 10),
          totalPages: Math.ceil(count / parseInt(queryParams.pageSize || 10)),
          totalCount: count
        }
      };
    }
    
    // 5. Default response for unknown endpoints
    else {
      return { 
        success: false, 
        message: 'Endpoint not found' 
      };
    }
  } catch (error) {
    console.error(`Error in ${path} endpoint:`, error);
    return { 
      success: false, 
      message: error.message || 'An unknown error occurred',
      error: error.message
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing Authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get user session from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Process the API request
    const result = await handleRequest(req, supabase);
    
    // Log the activity
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'api_access',
        category: 'DATA_SYNC',
        severity: 'info',
        details: { 
          path: new URL(req.url).pathname,
          method: req.method,
          timestamp: new Date().toISOString()
        },
        status: result.success ? 'success' : 'failure',
        error_message: result.success ? null : (result.message || 'Unknown error')
      });
    
    // Return the API response
    return new Response(
      JSON.stringify(result),
      { 
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
})
