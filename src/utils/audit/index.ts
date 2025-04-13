
// Export types with the correct syntax for isolatedModules
export type { 
  AuditLogEntry,
  AuditLogEvent,
  AuditLogFilterOptions, 
  AuditLogResponse, 
  AuditLogExportResult 
} from './auditLoggerTypes';

// Export enums directly from auditLoggerTypes
export { AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

// Export functions from auditLoggerCore
export { 
  getAuditLogs, 
  logAuthEvent, 
  logDataAccess,
  exportAuditLogsToCSV,
  logAuditEvent
} from './auditLoggerCore';

// Export middleware functions
export { 
  ensureTargetResource, 
  createAuditLog, 
  adaptAuditLogEntry,
  adaptAuditLogEvent
} from './auditMiddleware';

// Export functions from auditLoggerExport
export {
  exportAuditLogsToPDF,
  downloadAuditLogsAsCSV,
  downloadAuditLogsAsPDF
} from './auditLoggerExport';

// Export helper functions
export {
  createAuditLogEvent,
  createTransactionAuditLog,
  createLoanAuditLog
} from './auditHelpers';

// Import required functions and types for the logPermissionFailure function
import { logAuditEvent } from './auditLoggerCore';
import { AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

// Add permission failure logging function
export function logPermissionFailure(userId: string, requiredPermission: string, resource: string) {
  return logAuditEvent({
    user_id: userId,
    action: 'permission_denied',
    category: AuditLogCategory.SECURITY,
    severity: AuditLogSeverity.WARNING,
    status: 'failure',
    target_resource: resource,
    details: { required_permission: requiredPermission },
    error_message: `Access denied: Missing permission (${requiredPermission})`
  });
}
