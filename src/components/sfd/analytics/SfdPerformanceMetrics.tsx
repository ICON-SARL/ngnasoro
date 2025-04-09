
import React from 'react';

interface SfdPerformanceMetricsProps {
  sfdId?: string;
}

export function SfdPerformanceMetrics({ sfdId }: SfdPerformanceMetricsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Taux de remboursement</span>
        <span className="font-medium">92%</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
      </div>
      
      <div className="flex justify-between mt-4">
        <span className="text-sm text-muted-foreground">Croissance clientèle</span>
        <span className="font-medium">+15%</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
      </div>
      
      <div className="flex justify-between mt-4">
        <span className="text-sm text-muted-foreground">Portefeuille à risque</span>
        <span className="font-medium">4.2%</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '4.2%' }}></div>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        Données de démonstration (non réelles)
      </p>
    </div>
  );
}
