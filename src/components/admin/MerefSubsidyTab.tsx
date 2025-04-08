
import React from 'react';
import { SubsidyRequestManagement } from './subsidy/SubsidyRequestManagement';

export function MerefSubsidyTab() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demandes de Prêt SFD</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de prêt des institutions de microfinance (SFD)
          </p>
        </div>
      </div>

      <SubsidyRequestManagement />
    </div>
  );
}
