
export enum AuditLogCategory {
  DATA_ACCESS = 'data_access',
  USER_MANAGEMENT = 'user_management',
  LOAN_PROCESSING = 'loan_processing',
  SECURITY = 'security',
  SYSTEM = 'system',
  FINANCIAL = 'financial',
}

export enum AuditLogSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLogEntry {
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: 'success' | 'failure';
  target_resource: string;
  details?: Record<string, any>;
  error_message?: string;
}

export const logAuditEvent = async (logEntry: AuditLogEntry): Promise<void> => {
  try {
    console.log('Audit log:', logEntry);
    // In a real application, this would send the log to the server
    // await fetch('/api/audit-logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry),
    // });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

export const logPermissionFailure = (userId: string, permission: string, resource: string): void => {
  logAuditEvent({
    user_id: userId,
    action: 'permission_check_failure',
    category: AuditLogCategory.SECURITY,
    severity: AuditLogSeverity.WARNING,
    status: 'failure',
    target_resource: resource,
    details: {
      required_permission: permission,
      timestamp: new Date().toISOString()
    },
    error_message: `Access denied: Missing permission (${permission})`
  });
};
