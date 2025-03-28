
import { supabase } from '@/integrations/supabase/client';
import { AuditLogEvent, AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

/**
 * Logs an audit event to the database
 */
export const logAuditEvent = async (event: AuditLogEvent) => {
  try {
    // Log to database
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: event.user_id,
        action: event.action,
        category: event.category,
        severity: event.severity,
        status: event.status,
        target_resource: event.target_resource,
        details: event.details,
        error_message: event.error_message,
        ip_address: event.ip_address,
        device_info: event.device_info
      });

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};

/**
 * Logs authentication events
 */
export const logAuthEvent = (userId: string, action: string, status: 'success' | 'failure', errorMessage?: string) => {
  return logAuditEvent({
    user_id: userId,
    action: action,
    category: AuditLogCategory.AUTHENTICATION,
    severity: status === 'success' ? AuditLogSeverity.INFO : AuditLogSeverity.WARNING,
    status: status,
    details: {
      timestamp: new Date().toISOString()
    },
    error_message: errorMessage
  });
};

/**
 * Logs data access events
 */
export const logDataAccess = (userId: string, action: string, resource: string, status: 'success' | 'failure', errorMessage?: string) => {
  return logAuditEvent({
    user_id: userId,
    action: action,
    category: AuditLogCategory.DATA_ACCESS,
    severity: status === 'success' ? AuditLogSeverity.INFO : AuditLogSeverity.WARNING,
    status: status,
    target_resource: resource,
    details: {
      timestamp: new Date().toISOString()
    },
    error_message: errorMessage
  });
};
