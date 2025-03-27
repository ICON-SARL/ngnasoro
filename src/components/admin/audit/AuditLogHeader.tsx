
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { AuditLogHeaderProps } from './types';

export function AuditLogHeader({ 
  showFilters, 
  setShowFilters,
  fetchLogs
}: AuditLogHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <div>
        <h2 className="text-xl font-semibold">Historique des Opérations SFD</h2>
        <p className="text-sm text-muted-foreground">
          Journal des modifications apportées aux SFDs
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Masquer les filtres' : 'Filtrer'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
