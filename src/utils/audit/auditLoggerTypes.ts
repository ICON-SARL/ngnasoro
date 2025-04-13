
// Exporting the enums separately to make sure they're properly exported
export enum AuditLogCategory {
  AUTHENTICATION = 'authentication',
  DATA_ACCESS = 'data_access',
  ADMIN_ACTION = 'admin_action',
  SFD_OPERATIONS = 'sfd_operations',
  SUBSIDY_OPERATIONS = 'subsidy_operations',
  USER_MANAGEMENT = 'user_management',
  SYSTEM = 'system',
  TOKEN_MANAGEMENT = 'token_management',
  FINANCIAL = 'financial',
  INTEGRATION = 'integration',
  SECURITY = 'security',
  MONITORING = 'monitoring',
  LOAN_OPERATIONS = 'loan_operations',
  LOAN_PROCESSING = 'loan_processing'
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
  target_resource: string;
  details?: Record<string, any>;
  error_message?: string;
  ip_address?: string;
  device_info?: string;
  created_at?: string;
  id?: string; // Added for compatibility with database responses
}

// Interface for API response
export interface AuditLogResponse {
  logs: AuditLogEvent[];
  count?: number;
}

// Interface for filter options
export interface AuditLogFilterOptions {
  userId?: string;
  category?: AuditLogCategory | AuditLogCategory[];
  severity?: AuditLogSeverity | AuditLogSeverity[];
  status?: 'success' | 'failure' | 'pending';
  startDate?: string | Date;
  endDate?: string | Date;
  targetResource?: string;
  limit?: number;
  offset?: number;
}

// Interface for audit log entry for services
export interface AuditLogEntry extends AuditLogEvent {
  // This alias ensures backward compatibility
  metadata?: Record<string, any>; // Alias for details
}

// Interface for CSV export response
export interface AuditLogExportResult {
  success: boolean;
  csvString?: string;
  filename?: string;
  message?: string;
}
