
// Export types
export * from './auditLoggerTypes';

// Export core functions
export {
  logAuditEvent,
  getAuditLogs,
  logAuthEvent,
  logDataAccess
} from './auditLoggerCore';

// Export the CSV export function from auditLoggerCore and not from auditLoggerExport
export { exportAuditLogsToCSV } from './auditLoggerCore';

// Export other export functions without the conflicting one
export {
  downloadAuditLogsAsCSV,
  exportAuditLogsToPDF,
  downloadAuditLogsAsPDF
} from './auditLoggerExport';

// Export permissions
export * from './auditPermissions';

// Added explicit export for the logPermissionFailure function
export { logPermissionFailure } from './auditLogger';
