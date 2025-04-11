import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export function ClientManagement() {
  const queryClient = useQueryClient();
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gestion des Clients</h2>
        <p className="text-muted-foreground mb-4">
          Ce module vous permet de gérer vos clients, de consulter leurs informations et de suivre leurs activités.
        </p>
        
        {/* Contenu du module de gestion des clients */}
        <div className="text-center text-muted-foreground py-8">
          Contenu de la gestion des clients à implémenter
        </div>
      </CardContent>
    </Card>
  );
}
