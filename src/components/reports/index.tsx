
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { AutomatedReports } from './AutomatedReports';
import { TrendsAndCharts } from './TrendsAndCharts';
import { DataExport } from './DataExport';

export function Reports() {
  const [activeTab, setActiveTab] = useState('automated');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapports et analyses</CardTitle>
          <CardDescription>
            Générez des rapports personnalisés et analysez les performances de votre SFD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="automated">Rapports automatisés</TabsTrigger>
              <TabsTrigger value="trends">Tendances & Graphiques</TabsTrigger>
              <TabsTrigger value="export">Export des données</TabsTrigger>
            </TabsList>
            
            <TabsContent value="automated">
              <AutomatedReports />
            </TabsContent>
            
            <TabsContent value="trends">
              <TrendsAndCharts />
            </TabsContent>
            
            <TabsContent value="export">
              <DataExport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
