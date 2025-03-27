
import { useCallback } from 'react';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { Sfd } from '../../types/sfd-types';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/auditLogger';

export function useSfdExport(filteredSfds: Sfd[], statusFilter: string) {
  const { exportToPDF, exportToExcel, isExporting } = useFinancialExport();
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

  return {
    handleExportPdf,
    handleExportExcel,
    isExporting
  };
}
