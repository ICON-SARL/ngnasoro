
import { useToast } from '@/hooks/use-toast';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { exportService } from '@/services/exportService';
import { ExportFormat } from '@/types/export';

export interface AuditReportOptions {
  startDate?: string;
  endDate?: string;
  category?: AuditLogCategory;
  severity?: AuditLogSeverity;
  format: ExportFormat;
}

export function useAuditReportGeneration() {
  const { toast } = useToast();

  const generateAuditReport = async (options: AuditReportOptions) => {
    try {
      // Get data from the audit logs table
      const data = await exportService.getExportableData('audit_logs', {
        startDate: options.startDate,
        endDate: options.endDate,
        filters: {
          ...(options.category && { category: options.category }),
          ...(options.severity && { severity: options.severity })
        }
      });

      // Export the data in the requested format
      await exportService.exportData(data, options.format, {
        fileName: `audit_report_${new Date().toISOString().split('T')[0]}`,
        title: 'Rapport d\'audit',
        subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      });

      toast({
        title: 'Rapport généré avec succès',
        description: `Le rapport d'audit a été exporté au format ${options.format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Error generating audit report:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le rapport d\'audit',
        variant: 'destructive',
      });
    }
  };

  return {
    generateAuditReport
  };
}
