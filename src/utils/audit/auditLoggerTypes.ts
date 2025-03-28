
export enum AuditLogCategory {
  AUTHENTICATION = 'authentication',
  DATA_ACCESS = 'data_access',
  ADMIN_ACTION = 'admin_action',
  SFD_OPERATIONS = 'sfd_operations',
  SUBSIDY_OPERATIONS = 'subsidy_operations',
  USER_MANAGEMENT = 'user_management',
  SYSTEM = 'system'
}

export enum AuditLogSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AuditLogEvent {
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: 'success' | 'failure' | 'pending';
  target_resource?: string;
  details?: Record<string, any>;
  error_message?: string;
  ip_address?: string;
  device_info?: string;
}
