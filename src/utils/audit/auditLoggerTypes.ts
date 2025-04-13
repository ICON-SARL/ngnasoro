
// Export the enums directly from this file
export enum AuditLogCategory {
  DATA_ACCESS = 'data_access',
  USER_MANAGEMENT = 'user_management',
  LOAN_PROCESSING = 'loan_processing',
  SECURITY = 'security',
  SYSTEM = 'system',
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

export interface AuditLogEntry {
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: 'success' | 'failure' | 'pending';
  target_resource: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>; // Legacy field, use details instead
  error_message?: string;
  ip_address?: string;
  device_info?: string;
  created_at?: string;
  id?: string;
}

export interface AuditLogEvent {
  id?: string;
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: 'success' | 'failure' | 'pending';
  target_resource: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>; // Legacy field, use details instead
  error_message?: string;
  ip_address?: string;
  device_info?: string;
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
