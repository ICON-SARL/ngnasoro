
import { supabase } from '@/integrations/supabase/client';
import { AuditLogCategory, AuditLogSeverity, AuditLogEntry, AuditLogQueryOptions } from './auditLoggerTypes';

/**
 * Logs an audit event to the database
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    // Get IP address and device info if available
    let ipAddress = entry.ip_address;
    let deviceInfo = entry.device_info;
    
    if (!ipAddress || !deviceInfo) {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = ipAddress || data.ip;
        deviceInfo = deviceInfo || navigator.userAgent;
      } catch (e) {
        // Ignore errors from the IP service
      }
    }
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.user_id,
        action: entry.action,
        category: entry.category,
        severity: entry.severity,
        details: entry.details,
        ip_address: ipAddress,
        device_info: deviceInfo,
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
  options?: AuditLogQueryOptions
): Promise<any[]> => {
  try {
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
    
    // Pagination
    if (options?.page && options?.pageSize) {
      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    } else if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    // Sorting
    if (options?.sortBy) {
      const order = options.sortOrder || 'desc';
      query = query.order(options.sortBy, { ascending: order === 'asc' });
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
 * Log a permission check failure (for security analysis)
 */
export const logPermissionFailure = async (
  userId: string | undefined,
  requiredPermission: string,
  resource?: string
): Promise<void> => {
  await logAuditEvent({
    user_id: userId,
    action: 'permission_check',
    category: AuditLogCategory.AUTHENTICATION,
    severity: AuditLogSeverity.WARNING,
    details: { 
      requiredPermission,
      outcome: 'denied'
    },
    target_resource: resource,
    status: 'failure',
    error_message: `User does not have permission: ${requiredPermission}`
  });
};

/**
 * Log a successful subsidy approval event
 */
export const logSubsidyApproval = async (
  userId: string,
  subsidyId: string,
  sfdId: string,
  sfdName: string,
  amount: number,
  purpose: string
): Promise<void> => {
  await logAuditEvent({
    user_id: userId,
    action: 'subsidy_approval',
    category: AuditLogCategory.SUBSIDY_MANAGEMENT,
    severity: AuditLogSeverity.INFO,
    details: {
      subsidy_id: subsidyId,
      sfd_id: sfdId,
      sfd_name: sfdName,
      amount: amount,
      purpose: purpose,
      timestamp: new Date().toISOString()
    },
    target_resource: `subsidies/${subsidyId}`,
    status: 'success'
  });
};

/**
 * Log a loan approval event
 */
export const logLoanApproval = async (
  userId: string,
  loanId: string,
  clientId: string,
  sfdId: string,
  amount: number,
  subsidyRate: number
): Promise<void> => {
  await logAuditEvent({
    user_id: userId,
    action: 'loan_approval',
    category: AuditLogCategory.LOAN_MANAGEMENT,
    severity: AuditLogSeverity.INFO,
    details: {
      loan_id: loanId,
      client_id: clientId,
      sfd_id: sfdId,
      amount: amount,
      subsidy_rate: subsidyRate,
      timestamp: new Date().toISOString()
    },
    target_resource: `loans/${loanId}`,
    status: 'success'
  });
};
