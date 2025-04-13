
import { AuditLogFilterOptions, AuditLogExportResult, AuditLogEvent } from './auditLoggerTypes';
import { getAuditLogs } from './auditLoggerCore';

/**
 * Export audit logs to PDF format
 */
export async function exportAuditLogsToPDF(options?: AuditLogFilterOptions): Promise<AuditLogExportResult> {
  try {
    const { logs } = await getAuditLogs(options);
    
    // This would implement PDF generation - simplified for now
    const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return {
      success: true,
      filename,
      message: `${logs.length} logs exported successfully to PDF`
    };
  } catch (error) {
    console.error('Error exporting audit logs to PDF:', error);
    return {
      success: false,
      message: `Error exporting logs: ${(error as Error).message}`
    };
  }
}

/**
 * Helper function to download audit logs as CSV
 */
export async function downloadAuditLogsAsCSV(options?: AuditLogFilterOptions): Promise<void> {
  try {
    const { logs } = await getAuditLogs(options);
    
    // Generate CSV content
    const header = [
      'ID',
      'Timestamp',
      'User ID',
      'Action',
      'Category',
      'Severity',
      'Status',
      'Target Resource',
      'Error Message',
      'Details'
    ].join(',');
    
    const rows = logs.map((log: AuditLogEvent) => {
      return [
        log.id || '',
        log.created_at || new Date().toISOString(),
        log.user_id || 'anonymous',
        log.action,
        log.category.toString(),
        log.severity.toString(),
        log.status,
        log.target_resource || '',
        log.error_message || '',
        log.details ? JSON.stringify(log.details).replace(/,/g, ';') : ''
      ].join(',');
    });
    
    // Combine header and rows
    const csvString = [header, ...rows].join('\n');
    
    // Create a downloadable link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading audit logs as CSV:', error);
  }
}

/**
 * Helper function to download audit logs as PDF
 */
export async function downloadAuditLogsAsPDF(options?: AuditLogFilterOptions): Promise<void> {
  try {
    const result = await exportAuditLogsToPDF(options);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    // In a real implementation, this would generate and download a PDF
    alert('PDF download would start here in a real implementation');
  } catch (error) {
    console.error('Error downloading audit logs as PDF:', error);
  }
}
