
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw, Download } from 'lucide-react';
import { AuditLogHeaderProps } from './types';

export function AuditLogHeader({ showFilters, setShowFilters, fetchLogs }: AuditLogHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">Historique d'audit (SFDs)</h2>
        <p className="text-sm text-muted-foreground">
          Suivi des activités et modifications concernant les SFDs
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtres
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
