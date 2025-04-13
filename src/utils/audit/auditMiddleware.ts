
import { AuditLogEntry, AuditLogEvent } from './auditLoggerTypes';

/**
 * Middleware to add default target_resource if missing
 * This helps maintain backward compatibility with older code
 */
export const ensureTargetResource = (logEntry: Partial<AuditLogEntry>): AuditLogEntry => {
  return {
    ...logEntry as AuditLogEntry,
    target_resource: logEntry.target_resource || 'system'
  };
};

/**
 * Helper function to ensure any audit log has the required fields
 */
export const createAuditLog = (logData: Partial<AuditLogEntry>): AuditLogEntry => {
  // Provide default values for required fields
  return {
    user_id: logData.user_id || 'anonymous',
    action: logData.action || 'unknown_action',
    category: logData.category || 'system' as any,
    severity: logData.severity || 'info' as any,
    status: logData.status || 'success' as any,
    target_resource: logData.target_resource || 'system',
    details: logData.details || logData.metadata || {},
    ...(logData.error_message && { error_message: logData.error_message }),
    ...(logData.ip_address && { ip_address: logData.ip_address }),
    ...(logData.device_info && { device_info: logData.device_info }),
    ...(logData.created_at && { created_at: logData.created_at }),
    ...(logData.id && { id: logData.id })
  } as AuditLogEntry;
};

/**
 * Adapter function that automatically adds target_resource if missing
 * This ensures backward compatibility with existing code
 */
export const adaptAuditLogEntry = (logEntry: Omit<AuditLogEntry, 'target_resource'> | AuditLogEntry): AuditLogEntry => {
  const entry = logEntry as Partial<AuditLogEntry>;
  return {
    ...entry as AuditLogEntry,
    target_resource: entry.target_resource || 'system'
  };
};

/**
 * Adapter for AuditLogEvent type
 */
export const adaptAuditLogEvent = (logEvent: Omit<AuditLogEvent, 'target_resource'> | AuditLogEvent): AuditLogEvent => {
  const event = logEvent as Partial<AuditLogEvent>;
  return {
    ...event as AuditLogEvent,
    target_resource: event.target_resource || 'system'
  };
};
