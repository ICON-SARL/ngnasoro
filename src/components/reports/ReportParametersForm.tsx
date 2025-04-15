
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReportDefinition, ReportFormat, ReportParameters, ReportDateRange } from '@/types/report';
import { DateRange } from 'react-day-picker';

interface ReportParametersFormProps {
  report: ReportDefinition;
  onGenerateReport: (parameters: ReportParameters) => void;
  isGenerating: boolean;
}

export function ReportParametersForm({ 
  report, 
  onGenerateReport,
  isGenerating 
}: ReportParametersFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [format, setFormat] = useState<ReportFormat>('pdf');

  const isDateRangeRequired = report.schema.filters.date_range === 'required';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDateRangeRequired && (!dateRange?.from)) {
      return; // Don't submit if date range is required but not provided
    }
    
    // Convert DateRange to ReportDateRange (string-based version for API)
    const reportDateRange: ReportDateRange | undefined = dateRange ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to ? dateRange.to.toISOString() : undefined
    } : undefined;
    
    onGenerateReport({
      date_range: reportDateRange,
      format
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Paramètres du rapport</CardTitle>
          <CardDescription>Configurez les options du rapport</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-range">
              Période {isDateRangeRequired && <span className="text-destructive">*</span>}
            </Label>
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Sélectionnez un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional filters based on report schema would go here */}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit"
            disabled={isGenerating || (isDateRangeRequired && (!dateRange?.from))}
            className="w-full"
          >
            {isGenerating ? 'Génération en cours...' : 'Générer le rapport'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
