
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export function ReportGenerator() {
  const queryClient = useQueryClient();
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Générateur de Rapports</h2>
        <p className="text-muted-foreground mb-4">
          Générez des rapports personnalisés pour suivre les performances de votre SFD.
        </p>
        
        {/* Contenu du générateur de rapports */}
        <div className="text-center text-muted-foreground py-8">
          Fonctionnalité de génération de rapports à implémenter
        </div>
      </CardContent>
    </Card>
  );
}
