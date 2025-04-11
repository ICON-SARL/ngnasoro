
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartsDisplay } from './ChartsDisplay';

export const ReportVisualization: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="charts">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
          <TabsTrigger value="tables">Tableaux</TabsTrigger>
          <TabsTrigger value="kpis">Indicateurs clés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          <ChartsDisplay />
        </TabsContent>
        
        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Visualisation en tableaux</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Cette fonctionnalité sera bientôt disponible
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs de performance</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Cette fonctionnalité sera bientôt disponible
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
