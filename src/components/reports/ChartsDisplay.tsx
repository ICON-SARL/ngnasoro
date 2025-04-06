
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart4 } from 'lucide-react';

export const ChartsDisplay: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            Évolution mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center bg-muted/10 rounded border">
          <p className="text-muted-foreground">Graphique d'évolution mensuelle des transactions</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            Répartition par SFD
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center bg-muted/10 rounded border">
          <p className="text-muted-foreground">Graphique de répartition par SFD</p>
        </CardContent>
      </Card>
    </div>
  );
};
