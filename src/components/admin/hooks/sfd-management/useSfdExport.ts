
import { useCallback, useState } from 'react';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { Sfd } from '../../types/sfd-types';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useSfdExport(filteredSfds: Sfd[], statusFilter: string) {
  const { exportToPDF, exportToExcel, isExporting: isExportingBase } = useFinancialExport();
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const { user } = useAuth();

  // Handle export to PDF
  const handleExportPdf = useCallback(() => {
    if (!filteredSfds.length) return;
    
    const sfdData = filteredSfds.map(sfd => ({
      ID: sfd.id,
      Nom: sfd.name,
      Code: sfd.code,
      Région: sfd.region || '-',
      Statut: sfd.status || 'active',
      'Date de création': new Date(sfd.created_at).toLocaleDateString(),
    }));
    
    exportToPDF(sfdData, {
      fileName: `sfds-export-${new Date().toISOString().split('T')[0]}`,
      title: 'Liste des SFDs',
      subtitle: `Généré le ${new Date().toLocaleDateString()}`
    });

    // Log audit event
    if (user) {
      logAuditEvent({
        user_id: user.id,
        action: 'export_sfds_pdf',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.INFO,
        details: { count: filteredSfds.length, filter: statusFilter },
        status: 'success',
      });
    }
  }, [filteredSfds, exportToPDF, statusFilter, user]);

  // Handle export to Excel
  const handleExportExcel = useCallback(() => {
    if (!filteredSfds.length) return;
    
    const sfdData = filteredSfds.map(sfd => ({
      ID: sfd.id,
      Nom: sfd.name,
      Code: sfd.code,
      Région: sfd.region || '-',
      Statut: sfd.status || 'active',
      'Date de création': new Date(sfd.created_at).toLocaleDateString(),
    }));
    
    exportToExcel(sfdData, {
      fileName: `sfds-export-${new Date().toISOString().split('T')[0]}`,
      title: 'Liste des SFDs',
    });

    // Log audit event
    if (user) {
      logAuditEvent({
        user_id: user.id,
        action: 'export_sfds_excel',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.INFO,
        details: { count: filteredSfds.length, filter: statusFilter },
        status: 'success',
      });
    }
  }, [filteredSfds, exportToExcel, statusFilter, user]);
  
  // Handle export to CSV
  const handleExportCsv = useCallback(() => {
    if (!filteredSfds.length) return;
    
    setIsExportingCsv(true);
    
    try {
      // Create CSV content
      const headers = ['ID', 'Nom', 'Code', 'Région', 'Statut', 'Solde Subvention', 'Date de création'];
      
      const rows = filteredSfds.map(sfd => [
        sfd.id,
        sfd.name,
        sfd.code,
        sfd.region || '-',
        sfd.status || 'active',
        sfd.subsidy_balance ? sfd.subsidy_balance.toString() : '0',
        new Date(sfd.created_at).toLocaleDateString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sfds-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'export_sfds_csv',
          category: AuditLogCategory.DATA_ACCESS,
          severity: AuditLogSeverity.INFO,
          details: { count: filteredSfds.length, filter: statusFilter },
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      
      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'export_sfds_csv',
          category: AuditLogCategory.DATA_ACCESS,
          severity: AuditLogSeverity.ERROR,
          details: { error: String(error), filter: statusFilter },
          status: 'failure',
          error_message: String(error)
        });
      }
    } finally {
      setIsExportingCsv(false);
    }
  }, [filteredSfds, statusFilter, user]);

  const isExporting = isExportingBase || isExportingCsv;

  return {
    handleExportPdf,
    handleExportExcel,
    handleExportCsv,
    isExporting
  };
}
