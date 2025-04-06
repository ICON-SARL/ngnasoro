
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, ChevronDown, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface ReportFiltersProps {
  reportType: string;
  setReportType: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onExportToExcel: () => void;
  onExportToPDF: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  setReportType,
  dateRange,
  setDateRange,
  onExportToExcel,
  onExportToPDF,
  isExporting = false,
  isLoading = false
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={reportType} onValueChange={setReportType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type de rapport" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transactions">Transactions</SelectItem>
          <SelectItem value="loans">Prêts</SelectItem>
          <SelectItem value="subsidies">Subventions</SelectItem>
          <SelectItem value="sfds">SFDs</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Sélectionner une période</span>
              )}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateRangePicker
              date={dateRange}
              setDate={setDateRange}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onExportToExcel} 
        disabled={isExporting || isLoading}
        className="md:ml-2"
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        Excel
      </Button>
      
      <Button 
        onClick={onExportToPDF} 
        disabled={isExporting || isLoading}
      >
        <FileText className="h-4 w-4 mr-1" />
        PDF
      </Button>
    </div>
  );
};
