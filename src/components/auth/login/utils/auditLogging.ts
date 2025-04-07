
import { supabase } from '@/integrations/supabase/client';

export const logSuccessfulAuthentication = async (
  userId: string, 
  email: string,
  adminMode: boolean = false,
  isSfdAdmin: boolean = false
) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'authentication',
      details: {
        email,
        success: true,
        admin_mode: adminMode,
        sfd_admin_mode: isSfdAdmin
      },
      status: 'success',
      category: 'auth',
      severity: 'info',
      target_resource: 'auth/login'
    });
  } catch (error) {
    console.error("Failed to log successful auth:", error);
  }
};

export const logFailedAuthentication = async (
  userId: string,
  email: string,
  adminMode: boolean = false,
  isSfdAdmin: boolean = false,
  errorMessage: string = "Unknown error"
) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'authentication_attempt',
      details: {
        email,
        success: false,
        admin_mode: adminMode,
        sfd_admin_mode: isSfdAdmin,
        error: errorMessage
      },
      status: 'failed',
      category: 'auth',
      severity: 'warning',
      target_resource: 'auth/login',
      error_message: errorMessage
    });
  } catch (error) {
    console.error("Failed to log auth attempt:", error);
  }
};
