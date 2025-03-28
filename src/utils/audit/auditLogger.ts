
/**
 * @deprecated This file is maintained for backward compatibility.
 * Import from '@/utils/audit' instead.
 */
export * from './auditLoggerCore';
export * from './auditLoggerTypes';
export * from './auditLoggerExport';

// Added explicit export for the logPermissionFailure function
export const logPermissionFailure = (userId: string, permission: string, location: string) => {
  // Import from auditLoggerTypes to avoid circular dependencies
  const { logAuditEvent } = require('./auditLoggerCore');
  const { AuditLogCategory, AuditLogSeverity } = require('./auditLoggerTypes');
  
  logAuditEvent({
    user_id: userId,
    action: 'permission_check_failure',
    category: AuditLogCategory.DATA_ACCESS,
    severity: AuditLogSeverity.WARNING,
    status: 'failure',
    target_resource: location,
    details: {
      required_permission: permission,
      timestamp: new Date().toISOString()
    },
    error_message: `Access denied: Missing permission (${permission})`
  });
};
