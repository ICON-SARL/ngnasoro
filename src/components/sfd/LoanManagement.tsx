import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export function LoanManagement() {
  const queryClient = useQueryClient();
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gestion des Prêts</h2>
        <p className="text-muted-foreground mb-4">
          Ce module vous permet de gérer les prêts, d'approuver des demandes et de suivre les remboursements.
        </p>
        
        {/* Contenu du module de gestion des prêts */}
        <div className="text-center text-muted-foreground py-8">
          Contenu de la gestion des prêts à implémenter
        </div>
      </CardContent>
    </Card>
  );
}
