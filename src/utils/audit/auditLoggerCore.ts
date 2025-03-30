
import { supabase } from '@/integrations/supabase/client';
import { AuditLogEntry, AuditLogEvent, AuditLogFilterOptions } from './auditLoggerTypes';

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

export async function getAuditLogs(options?: AuditLogFilterOptions) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*');
    
    // Apply filters if provided
    if (options) {
      if (options.category) {
        query = query.eq('category', options.category);
      }
      
      if (options.severity) {
        query = query.eq('severity', options.severity);
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
    
    return { logs: data || [] };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { logs: [] };
  }
}

// Helper function for authentication-related events
export async function logAuthEvent(entry: Omit<AuditLogEntry, 'category'>) {
  return logAuditEvent({
    ...entry,
    category: 'AUTHENTICATION'
  });
}

// Helper function for data access events
export async function logDataAccess(entry: Omit<AuditLogEntry, 'category'>) {
  return logAuditEvent({
    ...entry,
    category: 'DATA_ACCESS'
  });
}

// Export function for CSV
export async function exportAuditLogsToCSV(options?: AuditLogFilterOptions) {
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
    const rows = logs.map((log: AuditLogEvent & { id: string, created_at: string }) => {
      return [
        log.id,
        log.created_at,
        log.user_id || 'anonymous',
        log.action,
        log.category,
        log.severity,
        log.status,
        log.target_resource || '',
        log.error_message || '',
        log.details ? JSON.stringify(log.details).replace(/,/g, ';') : ''
      ].join(',');
    });
    
    // Combine header and rows
    return [header, ...rows].join('\n');
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    throw error;
  }
}
