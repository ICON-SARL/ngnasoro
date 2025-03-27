
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Calendar } from 'lucide-react';

interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  format: string;
  frequency: string;
  lastGenerated: string;
}

interface ReportTemplateCardProps {
  template: ReportTemplate;
}

export const ReportTemplateCard: React.FC<ReportTemplateCardProps> = ({ template }) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{template.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {template.description}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline">
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              {template.format}
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {template.frequency}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Générer
        </Button>
      </div>
    </div>
  );
};
