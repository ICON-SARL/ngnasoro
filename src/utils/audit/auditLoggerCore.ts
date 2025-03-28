
import { supabase } from '@/integrations/supabase/client';
import { AuditLogCategory, AuditLogEntry, AuditLogQueryOptions, AuditLogSeverity } from './auditLoggerTypes';

/**
 * Log an audit event to the database
 * @param entry The audit log entry to save
 */
export async function logAuditEvent(entry: Partial<AuditLogEntry> & {
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: 'success' | 'failure';
}): Promise<{success: boolean; error?: any}> {
  try {
    // If we don't have a user_id, set a placeholder value for database constraint
    const finalEntry: AuditLogEntry = {
      user_id: entry.user_id || '00000000-0000-0000-0000-000000000000',
      action: entry.action,
      category: entry.category,
      severity: entry.severity,
      status: entry.status,
      details: entry.details,
      ip_address: entry.ip_address,
      device_info: entry.device_info,
      target_resource: entry.target_resource,
      error_message: entry.error_message
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(finalEntry);

    if (error) {
      console.error('Error logging audit event:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in logAuditEvent:', error);
    return { success: false, error };
  }
}

/**
 * Query audit logs with filters
 * @param options Filter and pagination options
 */
export async function getAuditLogs(options: AuditLogQueryOptions = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*');

    // Apply filters
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    
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
    
    // Apply sorting
    if (options.sortBy) {
      const order = options.sortOrder?.ascending ? 'asc' : 'desc';
      query = query.order(options.sortBy, { ascending: options.sortOrder?.ascending });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    } else if (options.page !== undefined && options.pageSize) {
      const start = options.page * options.pageSize;
      query = query.range(start, start + options.pageSize - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
}

/**
 * Count audit logs with filters
 * @param options Filter options
 */
export async function countAuditLogs(options: Omit<AuditLogQueryOptions, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'> = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });
    
    // Apply filters
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    
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
    
    const { count, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error counting audit logs:', error);
    throw error;
  }
}
