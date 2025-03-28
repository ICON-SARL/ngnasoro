
import { AuditLogEvent, AuditLogFilterOptions, AuditLogResponse, AuditLogExportResult, AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

/**
 * Log an audit event
 */
export const logAuditEvent = async (event: AuditLogEvent): Promise<void> => {
  try {
    // Ensure created_at is set
    const auditEvent = {
      ...event,
      created_at: event.created_at || new Date().toISOString()
    };
    
    // Store in Supabase
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEvent);
    
    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (err) {
    // Silent fail - audit logging should never break the application
    console.error('Failed to log audit event:', err);
  }
};

/**
 * Get audit logs with filtering options
 */
export const getAuditLogs = async (options?: AuditLogFilterOptions): Promise<AuditLogResponse> => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });
    
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
    
    if (options?.targetResource) {
      query = query.ilike('target_resource', `%${options.targetResource}%`);
    }
    
    if (options?.startDate) {
      const startDate = typeof options.startDate === 'string' 
        ? options.startDate 
        : options.startDate.toISOString();
      query = query.gte('created_at', startDate);
    }
    
    if (options?.endDate) {
      const endDate = typeof options.endDate === 'string' 
        ? options.endDate 
        : options.endDate.toISOString();
      query = query.lte('created_at', endDate);
    }
    
    // Pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }
    
    // Ordering
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      logs: data || [],
      count: count || 0
    };
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return { logs: [], count: 0 };
  }
};

/**
 * Export audit logs to CSV format
 */
export const exportAuditLogsToCSV = async (options?: AuditLogFilterOptions): Promise<AuditLogExportResult> => {
  try {
    const { logs } = await getAuditLogs(options);
    
    if (logs.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      };
    }
    
    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'Action',
      'Category',
      'Severity',
      'Status',
      'Target Resource',
      'Error Message',
      'Details',
      'IP Address'
    ].join(',');
    
    // Format each log into a CSV row
    const rows = logs.map(log => [
      log.created_at ? `"${log.created_at}"` : '',
      log.user_id ? `"${log.user_id}"` : '',
      log.action ? `"${log.action}"` : '',
      log.category ? `"${log.category}"` : '',
      log.severity ? `"${log.severity}"` : '',
      log.status ? `"${log.status}"` : '',
      log.target_resource ? `"${log.target_resource}"` : '',
      log.error_message ? `"${log.error_message.replace(/"/g, '""')}"` : '',
      log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : '',
      log.ip_address ? `"${log.ip_address}"` : ''
    ].join(','));
    
    // Combine into a CSV string
    const csvString = [headers, ...rows].join('\n');
    
    // Generate filename with current date
    const filename = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    return {
      success: true,
      csvString,
      filename
    };
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return {
      success: false,
      message: String(error)
    };
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
