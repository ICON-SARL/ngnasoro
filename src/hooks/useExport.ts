
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportService } from '@/services/exportService';
import { ExportFormat, ExportOptions } from '@/types/export';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (
    type: string,
    format: ExportFormat,
    options?: ExportOptions
  ) => {
    try {
      setIsExporting(true);
      
      // Fetch data
      const data = await exportService.getExportableData(type, options);
      
      // Prepare export config
      const config = {
        fileName: `${type}_export_${new Date().toISOString().split('T')[0]}`,
        title: `Export ${type}`,
        subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        columns: options?.columns
      };

      // Export data in requested format
      await exportService.exportData(data, format, config);

      toast({
        title: 'Export réussi',
        description: `Les données ont été exportées au format ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Erreur lors de l\'export',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting
  };
}
