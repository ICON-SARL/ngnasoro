
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export function DataExport() {
  const queryClient = useQueryClient();
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Export des Données</h2>
        <p className="text-muted-foreground mb-4">
          Exportez vos données dans différents formats pour analyse externe.
        </p>
        
        {/* Contenu de l'export de données */}
        <div className="text-center text-muted-foreground py-8">
          Fonctionnalité d'export de données à implémenter
        </div>
      </CardContent>
    </Card>
  );
}
