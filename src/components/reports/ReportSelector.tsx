
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ReportDefinition } from '@/types/report';
import { FileBarChart, FilePieChart, FileSpreadsheet } from 'lucide-react';

interface ReportSelectorProps {
  reports: ReportDefinition[];
  selectedReportId: string | null;
  onSelectReport: (reportId: string) => void;
}

export function ReportSelector({ 
  reports, 
  selectedReportId, 
  onSelectReport 
}: ReportSelectorProps) {
  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un rapport</CardTitle>
          <CardDescription>Aucun rapport disponible</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'transaction_summary':
        return <FileBarChart className="h-10 w-10 text-primary" />;
      case 'client_activity':
        return <FilePieChart className="h-10 w-10 text-primary" />;
      default:
        return <FileSpreadsheet className="h-10 w-10 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sélectionner un rapport</CardTitle>
        <CardDescription>Choisissez le type de rapport à générer</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedReportId || undefined} 
          onValueChange={onSelectReport}
        >
          {reports.map((report) => (
            <div 
              key={report.id} 
              className={`flex items-start space-x-4 rounded-md border p-4 
              ${selectedReportId === report.id ? 'bg-muted border-primary' : ''}`}
            >
              <RadioGroupItem value={report.id} id={report.id} className="mt-1" />
              <div className="flex flex-1 space-x-4">
                <div className="mt-0.5">
                  {getReportIcon(report.type)}
                </div>
                <div className="space-y-1">
                  <Label 
                    htmlFor={report.id} 
                    className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {report.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
