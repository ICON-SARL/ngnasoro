
import { getAuditLogs } from './auditLoggerCore';
import { AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

export async function exportAuditLogsToCSV(options?: {
  category?: AuditLogCategory;
  severity?: AuditLogSeverity;
  startDate?: string;
  endDate?: string;
  status?: 'success' | 'failure';
}): Promise<void> {
  try {
    // Fetch logs with provided options
    const logs = await getAuditLogs({
      ...options,
      limit: 1000, // Limit to 1000 records for export
      sortBy: 'created_at',
      sortOrder: { ascending: false }
    });
    
    if (!logs || logs.length === 0) {
      throw new Error('No logs available to export');
    }
    
    // Define CSV headers
    const headers = [
      'Date', 
      'User ID', 
      'Action', 
      'Category', 
      'Severity', 
      'Status', 
      'Target Resource', 
      'Error Message', 
      'Details'
    ];
    
    // Format log data for CSV
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString('fr-FR'),
      log.user_id,
      log.action,
      log.category,
      log.severity,
      log.status,
      log.target_resource || '',
      log.error_message || '',
      log.details ? JSON.stringify(log.details) : ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    throw error;
  }
}
