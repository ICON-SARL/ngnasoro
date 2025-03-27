
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportTemplateCard } from './ReportTemplateCard';
import { ScheduledReportTable } from './ScheduledReportTable';
import { ReportVisualization } from './ReportVisualization';
import { reportTemplates, scheduledReports } from './data';
import { Download, FileText, PlusCircle } from 'lucide-react';

export const ReportGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');

  const handleGenerateReport = (templateId: number) => {
    console.log('Generating report with template ID:', templateId);
    // Génération du rapport (à implémenter)
  };

  const handleExportScheduled = (reportId: number) => {
    console.log('Exporting scheduled report ID:', reportId);
    // Téléchargement du rapport planifié (à implémenter)
  };

  const handleViewScheduled = (reportId: number) => {
    console.log('Viewing scheduled report ID:', reportId);
    // Affichage du rapport planifié (à implémenter)
  };

  const handleCreateTemplate = () => {
    console.log('Creating new report template');
    // Création d'un nouveau modèle (à implémenter)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Générateur de Rapports</h1>
        <Button onClick={handleCreateTemplate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Modèle
        </Button>
      </div>
      
      <Card>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Rapports & Analyses</CardTitle>
                <CardDescription>
                  Créez, planifiez et téléchargez des rapports pour votre organisation
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="templates">Modèles</TabsTrigger>
                <TabsTrigger value="scheduled">Planifiés</TabsTrigger>
                <TabsTrigger value="visualizations">Visualisations</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {reportTemplates.map((template) => (
                  <ReportTemplateCard key={template.id} template={template} />
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter tous les rapports
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled">
              <ScheduledReportTable 
                reports={scheduledReports} 
                onExport={handleExportScheduled}
                onView={handleViewScheduled}
              />
            </TabsContent>
            
            <TabsContent value="visualizations">
              <ReportVisualization />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};
