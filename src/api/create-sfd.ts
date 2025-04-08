
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      status: 204,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { sfd_data, admin_id } = body;
    
    if (!sfd_data || !admin_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log("Processing SFD creation:", { sfd_data, admin_id });
    
    // Check if SFD with same code already exists
    const { data: existingSfd, error: checkError } = await supabase
      .from('sfds')
      .select('id, code')
      .eq('code', sfd_data.code)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing SFD:", checkError);
      return new Response(
        JSON.stringify({ error: `Error checking existing SFD: ${checkError.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    if (existingSfd) {
      console.error(`SFD with code ${sfd_data.code} already exists`);
      return new Response(
        JSON.stringify({ error: `Une SFD avec le code ${sfd_data.code} existe déjà` }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Define valid columns manually
    const validColumns = [
      'name', 'code', 'region', 'status', 'logo_url', 'phone',
      'subsidy_balance', 'created_at', 'updated_at'
    ];
    
    // Filter to valid columns only and ensure required fields are present
    const cleanedSfdData: { 
      name: string; 
      code: string; 
      region?: string; 
      status?: string; 
      logo_url?: string;
      phone?: string;
      subsidy_balance?: number;
      created_at?: string;
      updated_at?: string;
    } = {
      name: sfd_data.name,
      code: sfd_data.code
    };
    
    // Add optional properties if they exist
    for (const key of validColumns) {
      if (key !== 'name' && key !== 'code' && key in sfd_data) {
        cleanedSfdData[key as keyof typeof cleanedSfdData] = sfd_data[key];
      }
    }
    
    console.log("Creating new SFD with cleaned data:", cleanedSfdData);
    
    // 1. Insert the SFD data
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .insert(cleanedSfdData)
      .select()
      .single();
    
    if (sfdError) {
      console.error("Error creating SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `Error creating SFD: ${sfdError.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    console.log("SFD created successfully:", sfdData);
    
    // 2. Create initial SFD stats
    const { error: statsError } = await supabase
      .from('sfd_stats')
      .insert({
        sfd_id: sfdData.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0
      });
    
    if (statsError) {
      console.warn("Error creating initial SFD stats:", statsError);
    } else {
      console.log("Initial SFD stats created");
    }
    
    // 3. If admin_id is provided, associate the admin with the SFD
    if (admin_id) {
      const { error: userSfdError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: admin_id,
          sfd_id: sfdData.id,
          is_default: true
        });
        
      if (userSfdError) {
        console.warn("Error associating admin with SFD:", userSfdError);
      } else {
        console.log(`Admin ${admin_id} associated with SFD ${sfdData.id}`);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: sfdData
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
  } catch (error: any) {
    console.error("API error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Error creating SFD: ${error.message}` 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
