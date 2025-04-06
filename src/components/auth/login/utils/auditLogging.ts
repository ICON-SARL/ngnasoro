
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export const logSuccessfulAuthentication = async (
  userId: string | undefined, 
  email: string, 
  adminMode: boolean, 
  isSfdAdmin: boolean
) => {
  if (!userId) return;
  
  try {
    await logAuditEvent({
      user_id: userId,
      action: isSfdAdmin ? "sfd_admin_login_attempt" : adminMode ? "admin_login_attempt" : "password_login_attempt",
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      details: { email, admin_mode: adminMode, sfd_admin: isSfdAdmin }
    });
  } catch (err) {
    console.warn('Failed to log audit event:', err);
  }
};

export const logFailedAuthentication = async (
  userId: string | undefined, 
  email: string, 
  adminMode: boolean, 
  isSfdAdmin: boolean,
  errorMessage: string
) => {
  try {
    await logAuditEvent({
      user_id: userId || 'anonymous', 
      action: isSfdAdmin ? "sfd_admin_login_failed" : adminMode ? "admin_login_failed" : "password_login_attempt",
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.WARNING,
      status: 'failure',
      error_message: errorMessage,
      details: { email, admin_mode: adminMode, sfd_admin: isSfdAdmin }
    });
  } catch (err) {
    console.warn('Failed to log audit event:', err);
  }
};
