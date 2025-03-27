
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Calendar } from 'lucide-react';
import { ReportTemplateCard } from './ReportTemplateCard';
import { ScheduledReportTable } from './ScheduledReportTable';
import { ReportVisualization } from './ReportVisualization';
import { reportTemplates, scheduledReports } from './data';

export const ReportGenerator = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Générateur de Rapports</h2>
          <p className="text-sm text-muted-foreground">
            Génération automatisée de rapports au format PDF et Excel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Planifier
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-1" />
            Nouveau Rapport
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Modèles de Rapports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <ReportTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Rapports récents & programmés</h3>
          <ScheduledReportTable reports={scheduledReports} />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Visualisation des données</h3>
          <ReportVisualization />
        </div>
      </div>
    </div>
  );
};
