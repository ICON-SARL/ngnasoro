
import React from 'react';
import { Shield, Filter, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLogHeaderProps {
  onToggleFilters: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
}

export function AuditLogHeader({ onToggleFilters, onRefresh, onExportCsv }: AuditLogHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Journal d'Audit
        </h2>
        <p className="text-sm text-muted-foreground">
          Traçabilité complète des actions effectuées par les administrateurs
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtres
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualiser
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
        >
          <Download className="h-4 w-4 mr-1" />
          Exporter CSV
        </Button>
      </div>
    </div>
  );
}
