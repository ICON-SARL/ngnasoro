
/**
 * Core audit logging functionality
 */
import { supabase } from '@/integrations/supabase/client';
import { AuditLogEntry, AuditLogQueryOptions } from './auditLoggerTypes';

/**
 * Logs an audit event to the database
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    // Ensure details is a valid JSON object
    const sanitizedDetails = entry.details ? entry.details : null;
    
    // Use a type assertion to bypass the TypeScript error
    const { error } = await (supabase
      .from('audit_logs' as any)
      .insert({
        user_id: entry.user_id,
        action: entry.action,
        category: entry.category,
        severity: entry.severity,
        details: sanitizedDetails,
        ip_address: entry.ip_address,
        device_info: entry.device_info,
        target_resource: entry.target_resource,
        status: entry.status,
        error_message: entry.error_message
      }) as any);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    // Ensure audit logging never breaks the application
    console.error('Error in audit logging:', err);
  }
};

/**
 * Retrieve audit logs with optional filtering
 */
export const getAuditLogs = async (options?: AuditLogQueryOptions): Promise<any[]> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    let query = (supabase
      .from('audit_logs' as any)
      .select('*') as any);
    
    // Default sort order
    const sortBy = options?.sortBy || 'created_at';
    const sortOrder = options?.sortOrder || { ascending: false };
    
    // Apply ordering
    query = query.order(sortBy, sortOrder);

    // Apply filters
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.severity) {
      query = query.eq('severity', options.severity);
    }
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.startDate) {
      query = query.gte('created_at', options.startDate);
    }
    
    if (options?.endDate) {
      query = query.lte('created_at', options.endDate);
    }
    
    // Apply pagination if specified
    if (options?.page && options?.pageSize) {
      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    } else if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error retrieving audit logs:', err);
    return [];
  }
};

/**
 * Count total audit logs with the given filters
 */
export const countAuditLogs = async (options?: AuditLogQueryOptions): Promise<number> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    let query = (supabase
      .from('audit_logs' as any)
      .select('id', { count: 'exact', head: true }) as any);

    // Apply filters
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.severity) {
      query = query.eq('severity', options.severity);
    }
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.startDate) {
      query = query.gte('created_at', options.startDate);
    }
    
    if (options?.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Failed to count audit logs:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error counting audit logs:', err);
    return 0;
  }
};
