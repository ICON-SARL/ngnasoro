
import { supabase } from '@/integrations/supabase/client';
import { AuditLogEvent, AuditLogCategory, AuditLogSeverity, AuditLogFilterOptions, AuditLogResponse } from './auditLoggerTypes';

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
 * Retrieve audit logs with optional filtering
 */
export const getAuditLogs = async (options?: AuditLogFilterOptions): Promise<AuditLogResponse> => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options?.category) {
      if (Array.isArray(options.category)) {
        query = query.in('category', options.category);
      } else {
        query = query.eq('category', options.category);
      }
    }
    
    if (options?.severity) {
      if (Array.isArray(options.severity)) {
        query = query.in('severity', options.severity);
      } else {
        query = query.eq('severity', options.severity);
      }
    }
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.startDate) {
      const startDate = options.startDate instanceof Date 
        ? options.startDate.toISOString() 
        : options.startDate;
      query = query.gte('created_at', startDate);
    }
    
    if (options?.endDate) {
      const endDate = options.endDate instanceof Date
        ? options.endDate.toISOString()
        : options.endDate;
      query = query.lte('created_at', endDate);
    }
    
    if (options?.targetResource) {
      query = query.eq('target_resource', options.targetResource);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to retrieve audit logs:', error);
      return { logs: [], count: 0 };
    }

    return { 
      logs: (data || []) as AuditLogEvent[], 
      count: count || 0 
    };
  } catch (err) {
    console.error('Error retrieving audit logs:', err);
    return { logs: [], count: 0 };
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
