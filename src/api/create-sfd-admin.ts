
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
    const { email, password, full_name, role, sfd_id } = body;
    
    if (!email || !password || !full_name || !sfd_id) {
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

    console.log("Processing SFD admin creation:", { email, full_name, role, sfd_id });
    
    // Check if SFD exists
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', sfd_id)
      .single();
      
    if (sfdError || !sfdData) {
      console.error("Error checking SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `SFD with ID ${sfd_id} not found` }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Check if user with email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (!checkError && existingUser) {
      return new Response(
        JSON.stringify({ error: `An administrator with email ${email} already exists` }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Create auth user
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: 'sfd_admin',
          sfd_id
        }
      }
    });
    
    if (userError) {
      console.error("Error creating auth user:", userError);
      return new Response(
        JSON.stringify({ error: `Error creating user: ${userError.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Create admin user entry
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userData.user.id,
        email,
        full_name,
        role: 'sfd_admin',
        has_2fa: false
      })
      .select()
      .single();
    
    if (adminError) {
      console.error("Error creating admin user:", adminError);
      return new Response(
        JSON.stringify({ error: `Error creating admin user: ${adminError.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Assign SFD_ADMIN role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'sfd_admin'
      });

    if (roleError) {
      console.warn("Error assigning role:", roleError);
      // Non-critical, continue
    }
    
    // Create user-SFD association
    const { error: userSfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userData.user.id,
        sfd_id: sfd_id,
        is_default: true
      });
      
    if (userSfdError) {
      console.error("Error creating user-SFD association:", userSfdError);
      return new Response(
        JSON.stringify({ error: `Error associating admin with SFD: ${userSfdError.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userData.user.id,
        message: "SFD admin created successfully"
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
        error: `Error creating SFD admin: ${error.message}` 
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
