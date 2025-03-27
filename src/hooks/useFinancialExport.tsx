import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transactions';
import 'jspdf-autotable';

// Add the missing method to jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportOptions {
  fileName: string;
  title?: string;
  subtitle?: string;
}

export function useFinancialExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async (data: any[], options: ExportOptions) => {
    try {
      setIsExporting(true);
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `${options.fileName}.xlsx`);
      
      toast({
        title: 'Export réussi',
        description: 'Le rapport a été exporté au format Excel',
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'export Excel',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (data: any[], options: ExportOptions) => {
    try {
      setIsExporting(true);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title if provided
      if (options.title) {
        doc.setFontSize(18);
        doc.text(options.title, 14, 22);
      }
      
      // Add subtitle if provided
      if (options.subtitle) {
        doc.setFontSize(12);
        doc.text(options.subtitle, 14, 32);
      }
      
      // Format data for autoTable
      const tableColumns = Object.keys(data[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        dataKey: key
      }));
      
      // Add table to PDF
      doc.autoTable({
        startY: options.subtitle ? 40 : 30,
        columns: tableColumns,
        body: data,
        headStyles: { fillColor: [75, 95, 140], textColor: 255 },
        bodyStyles: { textColor: 50 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      
      // Save the PDF file
      doc.save(`${options.fileName}.pdf`);
      
      toast({
        title: 'Export réussi',
        description: 'Le rapport a été exporté au format PDF',
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'export PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const prepareTransactionsForExport = (transactions: Transaction[]) => {
    return transactions.map(tx => ({
      ID: tx.id,
      Date: new Date(tx.created_at).toLocaleDateString(),
      Type: tx.type,
      Montant: tx.amount,
      Status: tx.status || 'success',
      Description: tx.description || '',
    }));
  };

  return {
    isExporting,
    exportToExcel,
    exportToPDF,
    prepareTransactionsForExport
  };
}
