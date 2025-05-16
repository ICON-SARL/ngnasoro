
// Utility function to clean up authentication state
export const cleanupAuthState = () => {
  console.log('Cleaning up auth state...');
  
  // Remove standard auth tokens
  sessionStorage.removeItem('user_role');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
};

// Function to handle robust sign out
export const handleRobustSignOut = async (supabase: any, navigate?: (path: string) => void) => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('Error during global sign out:', err);
      // Continue even if this fails
    }
    
    // If navigate function provided, redirect to auth page
    if (navigate) {
      navigate('/auth');
    } else if (window && window.location) {
      // Force page reload for a clean state
      window.location.href = '/auth';
    }
  } catch (error) {
    console.error('Error in handleRobustSignOut:', error);
  }
};
