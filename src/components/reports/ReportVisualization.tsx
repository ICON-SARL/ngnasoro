
import React from 'react';
import { Button } from '@/components/ui/button';
import { PieChart, BarChart4 } from 'lucide-react';

export const ReportVisualization: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Performance des prêts par région</h4>
          <Button variant="outline" size="sm">
            <PieChart className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
        <div className="h-64 flex items-center justify-center bg-muted/20 rounded border">
          <p className="text-muted-foreground">Graphique de performance des prêts</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Tendances des transactions (30 jours)</h4>
          <Button variant="outline" size="sm">
            <BarChart4 className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
        <div className="h-64 flex items-center justify-center bg-muted/20 rounded border">
          <p className="text-muted-foreground">Graphique des tendances</p>
        </div>
      </div>
    </div>
  );
};
