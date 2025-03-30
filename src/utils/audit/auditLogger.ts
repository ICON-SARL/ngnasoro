
/**
 * @deprecated This file is maintained for backward compatibility.
 * Import from '@/utils/audit' instead.
 */
export * from './auditLoggerTypes';
export { 
  logAuditEvent,
  getAuditLogs,
  logAuthEvent,
  logDataAccess 
} from './auditLoggerCore';

// Export only non-conflicting functions from export module
export { 
  downloadAuditLogsAsCSV,
  exportAuditLogsToPDF,
  downloadAuditLogsAsPDF
} from './auditLoggerExport';

// Import needed modules directly instead of using require
import { logAuditEvent } from './auditLoggerCore';
import { AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

// Added explicit export for the logPermissionFailure function
export const logPermissionFailure = (userId: string, permission: string, location: string) => {
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
