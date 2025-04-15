
import { supabase } from '@/integrations/supabase/client';
import { ExportFormat, ExportOptions } from '@/types/export';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export type ExportConfig = {
  fileName: string;
  title?: string;
  subtitle?: string;
  columns?: string[];
};

export const exportService = {
  async exportData<T>(
    data: T[],
    format: ExportFormat,
    config: ExportConfig
  ): Promise<string | void> {
    switch (format) {
      case 'excel':
        return this.exportToExcel(data, config);
      case 'csv':
        return this.exportToCsv(data, config);
      case 'pdf':
        return this.exportToPdf(data, config);
      case 'json':
        return this.exportToJson(data, config);
      default:
        throw new Error(`Format d'export non supporté: ${format}`);
    }
  },

  private exportToExcel<T>(data: T[], config: ExportConfig): void {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, config.title || 'Export');
    XLSX.writeFile(wb, `${config.fileName}.xlsx`);
  },

  private exportToCsv<T>(data: T[], config: ExportConfig): void {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.writeFile({ Sheets: { data: ws }, SheetNames: ['data'] }, `${config.fileName}.csv`);
  },

  private exportToPdf<T>(data: T[], config: ExportConfig): void {
    const doc = new jsPDF();

    if (config.title) {
      doc.setFontSize(16);
      doc.text(config.title, 14, 20);
    }

    if (config.subtitle) {
      doc.setFontSize(12);
      doc.text(config.subtitle, 14, 30);
    }

    doc.autoTable({
      head: [Object.keys(data[0] || {})],
      body: data.map(item => Object.values(item)),
      startY: config.subtitle ? 40 : 30,
      margin: { top: 15 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${config.fileName}.pdf`);
  },

  private exportToJson<T>(data: T[], config: ExportConfig): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async getExportableData(
    type: string,
    options?: ExportOptions
  ): Promise<any[]> {
    const { startDate, endDate, filters } = options || {};
    
    let query = supabase.from(type);

    if (startDate && endDate) {
      query = query.gte('created_at', startDate)
                  .lte('created_at', endDate);
    }

    // Add any additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query.select();
    
    if (error) throw error;
    return data;
  }
};
