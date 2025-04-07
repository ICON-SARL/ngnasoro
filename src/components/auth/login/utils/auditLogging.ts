
import { supabase } from '@/integrations/supabase/client';

// Log successful authentication attempt
export const logSuccessfulAuthentication = async (
  userId: string | undefined,
  email: string,
  adminMode: boolean,
  isSfdAdmin: boolean
) => {
  try {
    // Skip logging if userId is not available
    if (!userId || userId === 'pending') {
      console.log('Skipping audit log - no userId available');
      return;
    }

    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'password_login',
      category: 'authentication',
      severity: 'info',
      status: 'success',
      details: { email, admin_mode: adminMode, sfd_admin: isSfdAdmin }
    });

    if (error) {
      console.error('Error logging successful authentication:', error);
    }
  } catch (error) {
    console.error('Failed to log successful authentication:', error);
  }
};

// Log failed authentication attempt
export const logFailedAuthentication = async (
  userId: string | undefined,
  email: string,
  adminMode: boolean,
  isSfdAdmin: boolean,
  errorMessage: string
) => {
  try {
    // Skip logging if userId is not valid
    if (!userId || userId === 'pending' || userId === 'anonymous') {
      console.log('Skipping audit log - invalid userId');
      return;
    }
    
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'password_login_attempt',
      category: 'authentication',
      severity: 'warning',
      status: 'failure',
      error_message: errorMessage,
      details: { email, admin_mode: adminMode, sfd_admin: isSfdAdmin }
    });

    if (error) {
      console.error('Error logging failed authentication:', error);
    }
  } catch (error) {
    console.error('Failed to log failed authentication:', error);
  }
};
