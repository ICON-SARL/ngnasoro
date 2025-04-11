
import React from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Download, FileSpreadsheet, FilePdf } from 'lucide-react';

interface ReportFiltersProps {
  reportType: string;
  setReportType: (type: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onExportToExcel: () => void;
  onExportToPDF: () => void;
  isExporting: boolean;
  isLoading: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  setReportType,
  dateRange,
  setDateRange,
  onExportToExcel,
  onExportToPDF,
  isExporting,
  isLoading
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row items-start sm:items-center">
      <Select value={reportType} onValueChange={setReportType}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type de rapport" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Mensuel</SelectItem>
          <SelectItem value="quarter">Trimestriel</SelectItem>
          <SelectItem value="year">Annuel</SelectItem>
          <SelectItem value="custom">Personnalisé</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="w-full sm:w-auto">
        <DateRangePicker 
          value={dateRange} 
          onChange={setDateRange} 
          align="start"
        />
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <Button 
          variant="outline" 
          onClick={onExportToExcel}
          disabled={isExporting || isLoading}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
        </Button>
        <Button 
          variant="outline" 
          onClick={onExportToPDF}
          disabled={isExporting || isLoading}
        >
          <FilePdf className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
    </div>
  );
};
