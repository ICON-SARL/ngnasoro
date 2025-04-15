
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';

export function PermissionSyncStatus() {
  const { loading, error, refreshPermissions } = useEnhancedPermissions();

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={error ? "destructive" : loading ? "secondary" : "default"}
        className={loading ? "animate-pulse" : ""}
      >
        {loading ? "Mise à jour des permissions..." : 
         error ? "Erreur permissions" : 
         "Permissions synchronisées"}
      </Badge>
    </div>
  );
}
