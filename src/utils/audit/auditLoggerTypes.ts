
/**
 * Types for the audit logger
 */

export enum AuditLogCategory {
  // System categories
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ACCESS_CONTROL = 'access_control',
  SYSTEM = 'system',
  DATA_ACCESS = 'data_access',
  
  // Business categories
  USER_OPERATIONS = 'user_operations',
  SFD_OPERATIONS = 'sfd_operations',
  LOAN_OPERATIONS = 'loan_operations',
  PAYMENT_OPERATIONS = 'payment_operations',
  TOKEN_MANAGEMENT = 'token_management',
  SUBSIDY_OPERATIONS = 'subsidy_operations',
  CLIENT_OPERATIONS = 'client_operations'
}

export enum AuditLogSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AuditLogEntry {
  user_id: string;
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
  status?: 'success' | 'failure';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: { ascending: boolean };
}
