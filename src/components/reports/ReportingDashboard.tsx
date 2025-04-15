
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart, History } from 'lucide-react';
import { ReportSelector } from './ReportSelector';
import { ReportParametersForm } from './ReportParametersForm';
import { ReportHistoryTable } from './ReportHistoryTable';
import { useReports } from '@/hooks/useReports';
import { ReportParameters } from '@/types/report';

export function ReportingDashboard() {
  const { 
    reportDefinitions, 
    userReports, 
    selectedDefinition, 
    isLoading, 
    isGenerating,
    generateReport, 
    selectReportDefinition 
  } = useReports();
  
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleSelectReport = async (reportId: string) => {
    setSelectedReportId(reportId);
    await selectReportDefinition(reportId);
  };

  const handleGenerateReport = async (parameters: ReportParameters) => {
    if (selectedReportId) {
      await generateReport(selectedReportId, parameters);
      setActiveTab('history');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <FileBarChart className="inline mr-2 h-6 w-6" />
          Système de rapports
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="generate">Générer un rapport</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              Historique des rapports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generate" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ReportSelector 
                reports={reportDefinitions || []} 
                selectedReportId={selectedReportId}
                onSelectReport={handleSelectReport}
              />
            </div>
            
            <div>
              {selectedDefinition && (
                <ReportParametersForm 
                  report={selectedDefinition}
                  onGenerateReport={handleGenerateReport}
                  isGenerating={isGenerating}
                />
              )}
              
              {!selectedDefinition && selectedReportId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chargement...</CardTitle>
                    <CardDescription>
                      Récupération des informations du rapport
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
              
              {!selectedReportId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres du rapport</CardTitle>
                    <CardDescription>
                      Veuillez d'abord sélectionner un type de rapport
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des rapports</CardTitle>
              <CardDescription>
                Vos rapports générés précédemment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportHistoryTable 
                reports={userReports || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
