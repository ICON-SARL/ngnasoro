
import { supabase } from '@/integrations/supabase/client';
import { 
  AuditLogEntry, 
  AuditLogEvent, 
  AuditLogFilterOptions, 
  AuditLogCategory, 
  AuditLogSeverity,
  AuditLogExportResult,
  AuditLogResponse
} from './auditLoggerTypes';

export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    // Validate required fields
    if (!entry.action || !entry.category || !entry.severity || !entry.status) {
      throw new Error('Missing required audit log fields');
    }

    // Prepare the audit log entry with defaults
    const auditEntry = {
      user_id: entry.user_id || 'anonymous', // Make sure we accept 'anonymous' as a value
      action: entry.action,
      category: entry.category,
      severity: entry.severity,
      status: entry.status,
      target_resource: entry.target_resource,
      error_message: entry.error_message,
      details: entry.details ? entry.details : null,
      ip_address: null, // Will be filled by edge functions or server-side
      device_info: null, // Will be filled by edge functions or server-side
    };

    // Insert the audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return false;
  }
}

export async function getAuditLogs(options?: AuditLogFilterOptions): Promise<AuditLogResponse> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*');
    
    // Apply filters if provided
    if (options) {
      if (options.category) {
        if (Array.isArray(options.category)) {
          // For array of categories, use 'in' operator
          query = query.in('category', options.category.map(c => c.toString()));
        } else {
          // For single category, use 'eq' operator
          query = query.eq('category', options.category.toString());
        }
      }
      
      if (options.severity) {
        if (Array.isArray(options.severity)) {
          // For array of severities, use 'in' operator
          query = query.in('severity', options.severity.map(s => s.toString()));
        } else {
          // For single severity, use 'eq' operator
          query = query.eq('severity', options.severity.toString());
        }
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      
      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Convert the raw data to AuditLogEvent type
    // Handle converting database JSON to Record<string, any> type
    const typedLogs: AuditLogEvent[] = data?.map(log => {
      // Handle the details property correctly
      let parsedDetails: Record<string, any> | undefined = undefined;
      
      if (log.details) {
        if (typeof log.details === 'string') {
          try {
            parsedDetails = JSON.parse(log.details);
          } catch (e) {
            console.error('Error parsing details JSON:', e);
            parsedDetails = { raw: log.details };
          }
        } else if (typeof log.details === 'object') {
          parsedDetails = log.details as Record<string, any>;
        }
      }
      
      return {
        user_id: log.user_id || 'anonymous',
        action: log.action,
        category: log.category as AuditLogCategory,
        severity: log.severity as AuditLogSeverity,
        status: log.status as 'success' | 'failure' | 'pending',
        target_resource: log.target_resource || undefined,
        error_message: log.error_message || undefined,
        details: parsedDetails,
        ip_address: log.ip_address || undefined,
        device_info: log.device_info || undefined,
        created_at: log.created_at || undefined,
        id: log.id
      };
    }) || [];
    
    return { logs: typedLogs };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { logs: [] };
  }
}

// Helper function for authentication-related events
export async function logAuthEvent(entry: Omit<AuditLogEntry, 'category'>) {
  return logAuditEvent({
    ...entry,
    category: AuditLogCategory.AUTHENTICATION
  });
}

// Helper function for data access events
export async function logDataAccess(entry: Omit<AuditLogEntry, 'category'>) {
  return logAuditEvent({
    ...entry,
    category: AuditLogCategory.DATA_ACCESS
  });
}

// Export function for CSV
export async function exportAuditLogsToCSV(options?: AuditLogFilterOptions): Promise<AuditLogExportResult> {
  try {
    const { logs } = await getAuditLogs(options);
    
    // Generate CSV header
    const header = [
      'ID',
      'Timestamp',
      'User ID',
      'Action',
      'Category',
      'Severity',
      'Status',
      'Target Resource',
      'Error Message',
      'Details'
    ].join(',');
    
    // Generate CSV rows
    const rows = logs.map((log: AuditLogEvent) => {
      return [
        log.id || '',
        log.created_at || new Date().toISOString(),
        log.user_id || 'anonymous',
        log.action,
        log.category.toString(),
        log.severity.toString(),
        log.status,
        log.target_resource || '',
        log.error_message || '',
        log.details ? JSON.stringify(log.details).replace(/,/g, ';') : ''
      ].join(',');
    });
    
    // Combine header and rows
    const csvString = [header, ...rows].join('\n');
    const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    
    return {
      success: true,
      csvString,
      filename
    };
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    return {
      success: false,
      message: `Error exporting logs: ${(error as Error).message}`
    };
  }
}
