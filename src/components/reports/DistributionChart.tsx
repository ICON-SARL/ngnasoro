
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const DistributionChart: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par type</CardTitle>
        <CardDescription>
          Distribution des transactions par catégorie
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 rounded border">
        {isLoading ? (
          <p>Chargement des données...</p>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Graphique de répartition par type (utiliser Recharts)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
