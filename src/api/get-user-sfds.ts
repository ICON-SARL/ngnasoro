
import { supabase } from '@/integrations/supabase/client';

export async function GET(request: Request) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData || !userData.user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized', 
        data: null 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user's SFDs from supabase
    const { data, error } = await supabase
      .from('user_sfds')
      .select('sfd_id, sfds:sfd_id(id, name, code, logo_url, region)')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error('Error fetching SFDs:', error);
      return new Response(JSON.stringify({ 
        error: error.message, 
        data: null 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Transform the data to a simpler format
    const formattedData = data.map(item => ({
      id: item.sfds.id,
      name: item.sfds.name,
      code: item.sfds.code,
      logo_url: item.sfds.logo_url,
      region: item.sfds.region
    }));
    
    return new Response(JSON.stringify({ 
      data: formattedData
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Unexpected error in get-user-sfds:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error', 
      data: null 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
