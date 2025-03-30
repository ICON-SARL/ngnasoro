
import { supabase } from '@/integrations/supabase/client';

export const logAuditEvent = async (
  category: string,
  action: string,
  details?: any,
  targetResource?: string,
  severity: string = 'info',
  status: string = 'success'
) => {
  try {
    const { data, error } = await supabase.from('audit_logs').insert({
      category,
      action,
      details,
      target_resource: targetResource,
      severity,
      status,
    });

    if (error) {
      console.error('Error logging audit event:', error);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Error in logAuditEvent:', err);
    return { data: null, error: err };
  }
};

export const logPermissionFailure = async (
  userId: string, 
  requiredPermission: string, 
  path: string
) => {
  try {
    await logAuditEvent(
      'security',
      'permission_denied',
      {
        userId,
        requiredPermission,
        path,
      },
      'permission',
      'warning',
      'failure'
    );
  } catch (err) {
    console.error('Error logging permission failure:', err);
  }
};

export const logLoginAttempt = async (
  email: string,
  success: boolean,
  ipAddress?: string,
  deviceInfo?: string
) => {
  await logAuditEvent(
    'authentication',
    success ? 'login_success' : 'login_failure',
    {
      email,
      ipAddress,
      deviceInfo,
    },
    'user',
    success ? 'info' : 'warning',
    success ? 'success' : 'failure'
  );
};

export const logAdminAction = async (
  userId: string,
  action: string,
  targetEntity: string,
  details?: any
) => {
  await logAuditEvent(
    'admin',
    action,
    details,
    targetEntity,
    'info',
    'success'
  );
};
