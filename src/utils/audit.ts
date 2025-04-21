
export enum AuditLogCategory {
  SECURITY = 'security',
  USER = 'user',
  SYSTEM = 'system',
  LOAN = 'loan',
  TRANSACTION = 'transaction',
  CLIENT = 'client',
  SFD = 'sfd',
  ADMINISTRATION = 'administration',
  // Add the missing categories
  DATA_ACCESS = 'data_access',
  USER_MANAGEMENT = 'user_management',
  LOAN_PROCESSING = 'loan_processing',
  FINANCIAL = 'financial',
  AUTHENTICATION = 'authentication',
  ADMIN_ACTION = 'admin_action',
  SFD_OPERATIONS = 'sfd_operations',
  SUBSIDY_OPERATIONS = 'subsidy_operations',
  TOKEN_MANAGEMENT = 'token_management',
  INTEGRATION = 'integration',
  MONITORING = 'monitoring',
  LOAN_OPERATIONS = 'loan_operations'
}

export enum AuditLogSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AuditLogDetails {
  [key: string]: any;
}

export interface AuditLogEvent {
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: 'success' | 'failure' | 'pending';
  target_resource?: string;
  details?: AuditLogDetails;
  error_message?: string;
  ip_address?: string;
  device_info?: string;
}

export interface AuditLogEntry extends AuditLogEvent {
  id?: string;
  created_at?: string;
}

export interface AuditLogFilterOptions {
  category?: AuditLogCategory | AuditLogCategory[];
  severity?: AuditLogSeverity | AuditLogSeverity[];
  status?: 'success' | 'failure' | 'pending';
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'severity' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogResponse {
  logs: AuditLogEvent[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface AuditLogExportResult {
  success: boolean;
  filename?: string;
  csvString?: string;
  message?: string;
}

/**
 * Logs an audit event to the system with overloaded signatures
 */
export const logAuditEvent = async (
  actionOrEvent: string | AuditLogEvent,
  category?: AuditLogCategory,
  severity: AuditLogSeverity = AuditLogSeverity.INFO,
  details?: AuditLogDetails,
  userId?: string
): Promise<void> => {
  try {
    // Check if first parameter is an object (AuditLogEvent) or a string (action)
    if (typeof actionOrEvent === 'object') {
      // It's an AuditLogEvent object
      console.log(`[AUDIT] ${actionOrEvent.category}/${actionOrEvent.severity}: ${actionOrEvent.action}`, 
        actionOrEvent.details || {});
    } else {
      // It's using the string parameters
      console.log(`[AUDIT] ${category}/${severity}: ${actionOrEvent}`, details || {});
    }
    
    // Implementation of audit logging will be added here
    // For now, we're just logging to the console to resolve the missing function errors
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};

// Helper function for permission failures
export const logPermissionFailure = async (
  userId: string, 
  requiredPermission: string, 
  resource: string
): Promise<void> => {
  return logAuditEvent(
    'permission_denied',
    AuditLogCategory.SECURITY,
    AuditLogSeverity.WARNING,
    { 
      required_permission: requiredPermission,
      resource
    },
    userId
  );
};

// Helper functions to export from audit module
export const getAuditLogs = async (options?: AuditLogFilterOptions): Promise<AuditLogResponse> => {
  // Basic implementation returning empty logs for now
  console.log('Getting audit logs with options:', options);
  return { logs: [] };
};

export const exportAuditLogsToCSV = async (options?: AuditLogFilterOptions): Promise<AuditLogExportResult> => {
  // Basic implementation returning success for now
  console.log('Exporting audit logs with options:', options);
  return { 
    success: true, 
    filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
    csvString: 'timestamp,user_id,action,category,severity,status,details\n'
  };
};
