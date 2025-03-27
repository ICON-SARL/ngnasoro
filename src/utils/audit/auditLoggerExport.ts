
/**
 * Export functionality for audit logs
 */
import { getAuditLogs } from './auditLoggerCore';
import { AuditLogQueryOptions } from './auditLoggerTypes';

/**
 * Export audit logs to CSV format
 */
export const exportAuditLogsToCSV = async (options?: AuditLogQueryOptions): Promise<string> => {
  try {
    // Get filtered logs
    const logs = await getAuditLogs({
      ...options,
      limit: 10000 // Set a reasonable limit for export
    });
    
    if (logs.length === 0) {
      return 'No data to export';
    }
    
    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'Action',
      'User ID',
      'Category',
      'Severity',
      'Status',
      'Target Resource',
      'IP Address',
      'Details',
      'Error Message'
    ];
    
    // Format data rows
    const rows = logs.map(log => [
      log.id,
      log.created_at,
      log.action,
      log.user_id || '',
      log.category,
      log.severity,
      log.status,
      log.target_resource || '',
      log.ip_address || '',
      JSON.stringify(log.details || {}),
      log.error_message || ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  } catch (err) {
    console.error('Error exporting audit logs to CSV:', err);
    throw err;
  }
};
