
/**
 * Types for the audit logging system
 */

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
  LOAN_MANAGEMENT = 'loan_management',
  SUBSIDY_MANAGEMENT = 'subsidy_management',
  ADMIN_ACTION = 'admin_action'
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

export interface AuditLogQueryOptions {
  userId?: string;
  category?: AuditLogCategory;
  severity?: AuditLogSeverity;
  startDate?: string;
  endDate?: string;
  limit?: number;
  status?: 'success' | 'failure';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
