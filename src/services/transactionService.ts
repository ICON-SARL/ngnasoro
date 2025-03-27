import { supabase } from '@/integrations/supabase/client';

export enum AuditLogSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AuditLogCategory {
  AUTHENTICATION = 'authentication',
  DATA_ACCESS = 'data_access',
  CONFIGURATION = 'configuration',
  TOKEN_MANAGEMENT = 'token_management',
  USER_MANAGEMENT = 'user_management',
  SFD_OPERATIONS = 'sfd_operations',
  CLIENT_MANAGEMENT = 'client_management',
  LOAN_MANAGEMENT = 'loan_management'
}

export interface AuditLogEntry {
  user_id?: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  details?: Record<string, any>;
  ip_address?: string;
  device_info?: string;
  target_resource?: string;
  status: 'success' | 'failure';
  error_message?: string;
}

/**
 * Logs an audit event to the database
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.user_id,
        action: entry.action,
        category: entry.category,
        severity: entry.severity,
        details: entry.details,
        ip_address: entry.ip_address,
        device_info: entry.device_info,
        target_resource: entry.target_resource,
        status: entry.status,
        error_message: entry.error_message
      });

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
export const getAuditLogs = async (
  options?: {
    userId?: string;
    category?: AuditLogCategory;
    severity?: AuditLogSeverity;
    startDate?: string;
    endDate?: string;
    limit?: number;
    status?: 'success' | 'failure';
  }
): Promise<any[]> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

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
    
    if (options?.limit) {
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
