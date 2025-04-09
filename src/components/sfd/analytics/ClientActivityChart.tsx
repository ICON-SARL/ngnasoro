
import React from 'react';

interface ClientActivityChartProps {
  sfdId?: string;
}

export function ClientActivityChart({ sfdId }: ClientActivityChartProps) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
      <p className="text-muted-foreground text-center">
        Graphique d'activité client<br />
        <span className="text-sm">(Données de démonstration)</span>
      </p>
    </div>
  );
}
