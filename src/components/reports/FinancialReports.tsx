
import React, { useState } from 'react';
import { subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { ReportHeader } from './ReportHeader';
import { ReportFilters } from './ReportFilters';
import { ReportTabContent } from './ReportTabContent';
import { ReportTemplates } from './ReportTemplates';

export const FinancialReports = () => {
  const [reportType, setReportType] = useState('month');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  const { allTransactions, isLoading } = useRealtimeTransactions();
  const { exportToExcel, exportToPDF, prepareTransactionsForExport, isExporting } = useFinancialExport();
  const { getReportData } = useReportGeneration();
  
  const handleExportToExcel = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    const reportData = await getReportData({
      type: reportType as any, 
      startDate: dateRange.from, 
      endDate: dateRange.to, 
      sfdId: undefined
    });
    
    const formattedData = prepareTransactionsForExport(reportData);
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    
    exportToExcel(formattedData, {
      fileName: `Rapport_Financier_${reportType}_${today}`,
      title: `Rapport Financier - ${reportType}`
    });
  };
  
  const handleExportToPDF = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    const reportData = await getReportData({
      type: reportType as any, 
      startDate: dateRange.from, 
      endDate: dateRange.to,
      sfdId: undefined
    });
    
    const formattedData = prepareTransactionsForExport(reportData);
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    
    exportToPDF(formattedData, {
      fileName: `Rapport_Financier_${reportType}_${today}`,
      title: `Rapport Financier - ${reportType}`,
      subtitle: `Période: ${dateRange.from 
        ? format(dateRange.from, 'dd/MM/yyyy', { locale: fr })
        : ''} - ${dateRange.to 
        ? format(dateRange.to, 'dd/MM/yyyy', { locale: fr })
        : ''}`
    });
  };

  const getFilteredTransactions = () => {
    if (!dateRange?.from || !dateRange?.to) return allTransactions;
    
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate >= dateRange.from! && txDate <= dateRange.to!;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="space-y-6">
      <ReportHeader 
        title="Génération de Rapports" 
        description="Analysez et exportez vos données financières"
      >
        <ReportFilters 
          reportType={reportType}
          setReportType={setReportType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onExportToExcel={handleExportToExcel}
          onExportToPDF={handleExportToPDF}
          isExporting={isExporting}
          isLoading={isLoading}
        />
      </ReportHeader>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
        </TabsList>
        
        <ReportTabContent 
          activeTab={activeTab} 
          transactions={filteredTransactions} 
          isLoading={isLoading} 
        />
      </Tabs>
      
      <ReportTemplates />
    </div>
  );
};
