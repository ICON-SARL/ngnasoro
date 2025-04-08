
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
    
    // Utiliser directement la service role key à travers l'API
    // au lieu d'une requête RLS pour contourner les politiques de sécurité
    
    // 1. Créer l'utilisateur admin sans RLS
    const userId = userData.user.id;
    const adminData = {
      id: userId,
      email,
      full_name,
      role: 'sfd_admin',
      has_2fa: false
    };
    
    // Appel à la fonction Edge pour créer l'admin
    console.log("Calling edge function to create admin with bypass RLS");
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create_sfd_admin', {
      body: {
        email,
        user_id: userId,
        full_name,
        role: 'sfd_admin',
        sfd_id
      }
    });
    
    if (edgeError || !edgeData?.success) {
      console.error("Edge function error:", edgeError || edgeData?.error);
      // Tenter de nettoyer l'utilisateur auth créé
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (cleanupError) {
        console.warn("Failed to clean up auth user after error:", cleanupError);
      }
      
      return new Response(
        JSON.stringify({ error: `Error creating admin: ${edgeError?.message || edgeData?.error || 'Unknown error'}` }),
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
