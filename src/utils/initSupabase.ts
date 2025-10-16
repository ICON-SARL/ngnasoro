
import { supabase } from "@/integrations/supabase/client";

export const initializeSupabase = async () => {
  try {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("User session found, logged in as:", session.user.email);
      
      // Check if user has required tables
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.warn("User profile not found, creating...");
        // Create profile if missing
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || ''
          });
          
        if (createProfileError) {
          console.error("Failed to create profile:", createProfileError);
        }
      }
      
      // Check if user has accounts
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (accountError) {
        console.warn("User account not found");
        // accounts table requires sfd_id, cannot create account automatically
        console.warn("Account creation requires sfd_id");
      }
    } else {
      console.log("No user session found");
    }
    
    console.log("Supabase initialized successfully");
  } catch (error) {
    console.error("Error initializing Supabase:", error);
  }
};
