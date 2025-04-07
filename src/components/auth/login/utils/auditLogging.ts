
import { supabase } from '@/integrations/supabase/client';

export const logSuccessfulAuthentication = async (
  userId: string, 
  email: string, 
  isAdminLogin: boolean = false,
  isSfdAdminLogin: boolean = false
) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'login_success',
      category: 'authentication',
      severity: 'info',
      details: { 
        email,
        isAdminLogin,
        isSfdAdminLogin,
        loginMethod: 'password',
        timestamp: new Date().toISOString()
      },
      status: 'success'
    });
  } catch (error) {
    console.warn('Failed to log successful authentication:', error);
  }
};

export const logFailedAuthentication = async (
  userId: string, 
  email: string, 
  isAdminLogin: boolean = false,
  isSfdAdminLogin: boolean = false,
  errorMessage?: string
) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'login_failure',
      category: 'authentication',
      severity: 'warning',
      details: { 
        email,
        isAdminLogin,
        isSfdAdminLogin,
        loginMethod: 'password',
        errorMessage,
        timestamp: new Date().toISOString()
      },
      status: 'failure',
      error_message: errorMessage
    });
  } catch (error) {
    console.warn('Failed to log failed authentication:', error);
  }
};
