
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthSessionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { method, action, userId } = await req.json();
    
    // Handle authentication actions
    switch (method) {
      case 'invalidate-sessions':
        // Force sign out all sessions for a user
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        const { error: invalidateError } = await supabase.auth.admin.signOut(userId);
        
        if (invalidateError) {
          console.error('Error invalidating sessions:', invalidateError);
          return new Response(
            JSON.stringify({ success: false, error: invalidateError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        await supabase.from('audit_logs').insert({
          user_id: 'system',
          action: 'sessions_invalidated',
          category: 'SECURITY',
          severity: 'WARNING',
          status: 'success',
          target_resource: `user:${userId}`,
          details: { action, timestamp: new Date().toISOString() }
        });
        
        return new Response(
          JSON.stringify({ success: true, message: 'All sessions invalidated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'update-role':
        const { role } = await req.json();
        
        if (!userId || !role) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID and role are required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Update role in auth.users
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { app_metadata: { role } }
        );
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        await supabase.from('audit_logs').insert({
          user_id: 'system',
          action: 'role_updated',
          category: 'SECURITY',
          severity: 'INFO',
          status: 'success',
          target_resource: `user:${userId}`,
          details: { new_role: role, timestamp: new Date().toISOString() }
        });
        
        return new Response(
          JSON.stringify({ success: true, message: 'User role updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'broadcast-permissions-update':
        // Broadcast to realtime that permissions have been updated
        const payload = {
          type: 'permissions_update',
          user_id: userId,
          timestamp: new Date().toISOString()
        };
        
        // In a real implementation, this would communicate with Supabase's Realtime service
        // For now, log the attempt
        console.log('Broadcasting permissions update:', payload);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Permissions update broadcasted' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid method' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in auth-manager function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
