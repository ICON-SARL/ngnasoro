
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
    const { email, password, full_name, role, sfd_id, user_id } = body;
    
    // Check which type of request this is - with user_id or with email/password
    const isExistingUser = !!user_id;
    
    if (isExistingUser) {
      if (!user_id || !full_name || !sfd_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required data for existing user' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    } else {
      if (!email || !password || !full_name || !sfd_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required data for new user' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    console.log("Processing SFD admin creation:", { 
      ...(email && { email }),
      full_name, 
      role, 
      sfd_id,
      ...(user_id && { user_id })
    });
    
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
    
    let userId = user_id;
    
    // If this is a new user, create the auth account
    if (!isExistingUser) {
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
      
      userId = userData.user.id;
    }
    
    // Create admin record
    try {
      // For mock API, we'll simulate creating the admin user
      console.log("Creating admin user record:", {
        id: userId,
        email: email || `admin-${userId}@example.com`,
        full_name,
        role: 'sfd_admin'
      });
      
      // Associate user with SFD
      console.log("Associating user with SFD:", {
        user_id: userId,
        sfd_id,
        is_default: true
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          user_id: userId,
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
    } catch (err: any) {
      console.error("Admin creation error:", err);
      
      return new Response(
        JSON.stringify({ 
          error: `Error creating admin record: ${err.message}` 
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
