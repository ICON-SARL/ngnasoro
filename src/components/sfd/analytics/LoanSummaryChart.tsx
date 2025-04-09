
import React from 'react';

interface LoanSummaryChartProps {
  sfdId?: string;
}

export function LoanSummaryChart({ sfdId }: LoanSummaryChartProps) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
      <p className="text-muted-foreground text-center">
        Résumé des crédits par statut<br />
        <span className="text-sm">(Données de démonstration)</span>
      </p>
    </div>
  );
}
