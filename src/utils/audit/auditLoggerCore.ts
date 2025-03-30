
import { supabase } from '@/integrations/supabase/client';
import { AuditLogEntry } from './auditLoggerTypes';

export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    // Validate required fields
    if (!entry.action || !entry.category || !entry.severity || !entry.status) {
      throw new Error('Missing required audit log fields');
    }

    // Prepare the audit log entry with defaults
    const auditEntry = {
      user_id: entry.user_id || 'anonymous', // Make sure we accept 'anonymous' as a value
      action: entry.action,
      category: entry.category,
      severity: entry.severity,
      status: entry.status,
      target_resource: entry.target_resource,
      error_message: entry.error_message,
      details: entry.details ? entry.details : null,
      ip_address: null, // Will be filled by edge functions or server-side
      device_info: null, // Will be filled by edge functions or server-side
    };

    // Insert the audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return false;
  }
}
