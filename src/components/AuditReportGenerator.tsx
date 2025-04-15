
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { useAuditReportGeneration } from '@/hooks/useAuditReportGeneration';
import { ExportFormat } from '@/types/export';
import { Download, FileText } from 'lucide-react';

export function AuditReportGenerator() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [category, setCategory] = useState<AuditLogCategory>();
  const [severity, setSeverity] = useState<AuditLogSeverity>();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  
  const { generateAuditReport } = useAuditReportGeneration();

  const handleGenerateReport = async () => {
    await generateAuditReport({
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      category,
      severity,
      format
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Générer un rapport d'audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Période</label>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={category} onValueChange={(value) => setCategory(value as AuditLogCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Toutes les catégories</SelectItem>
                {Object.values(AuditLogCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Sévérité</label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as AuditLogSeverity)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les sévérités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Toutes les sévérités</SelectItem>
                {Object.values(AuditLogSeverity).map((sev) => (
                  <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Format</label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerateReport}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Générer le rapport
        </Button>
      </CardContent>
    </Card>
  );
}
