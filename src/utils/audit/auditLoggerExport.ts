
import { AuditLogEvent } from './auditLoggerTypes';

/**
 * Formats a date for CSV export
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Converts audit logs to CSV format
 * @param logs The audit logs to convert
 * @returns CSV formatted string
 */
export const exportAuditLogsToCSV = (logs: AuditLogEvent[]): string => {
  // Define CSV headers
  const headers = [
    'Date',
    'User ID',
    'Action',
    'Category',
    'Severity',
    'Status',
    'Target Resource',
    'Details',
    'Error Message',
    'IP Address',
    'Device Info'
  ];

  // Convert logs to CSV rows
  const rows = logs.map(log => [
    formatDate(log.created_at?.toString() || new Date().toISOString()),
    log.user_id || '',
    log.action || '',
    log.category || '',
    log.severity || '',
    log.status || '',
    log.target_resource || '',
    log.details ? JSON.stringify(log.details) : '',
    log.error_message || '',
    log.ip_address || '',
    log.device_info || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Downloads audit logs as a CSV file
 * @param logs The audit logs to download
 * @param filename Optional filename (default: audit_logs_YYYY-MM-DD.csv)
 */
export const downloadAuditLogsAsCSV = (logs: AuditLogEvent[], filename?: string) => {
  const csvContent = exportAuditLogsToCSV(logs);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate a PDF report of audit logs
 * This is a placeholder - in a real implementation, you'd use a library like jsPDF
 */
export const exportAuditLogsToPDF = async (logs: AuditLogEvent[]): Promise<Blob> => {
  // For demonstration - in a real app, you'd generate a proper PDF
  // using a library like jsPDF or pdfmake
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Audit Logs Report', 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare data for autotable
  const tableColumn = ["Date", "User", "Action", "Category", "Status", "Resource"];
  const tableRows = logs.map(log => [
    formatDate(log.created_at?.toString() || new Date().toISOString()),
    log.user_id?.substring(0, 8) || 'N/A',
    log.action || 'N/A',
    log.category || 'N/A',
    log.status || 'N/A', 
    log.target_resource || 'N/A'
  ]);
  
  // Generate table
  autoTable(doc, { 
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid'
  });
  
  return doc.output('blob');
};

/**
 * Downloads audit logs as a PDF file
 */
export const downloadAuditLogsAsPDF = async (logs: AuditLogEvent[], filename?: string) => {
  const pdfBlob = await exportAuditLogsToPDF(logs);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `audit_logs_${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
