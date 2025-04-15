
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';

export function PermissionSyncStatus() {
  const { loading, refreshPermissions } = useEnhancedPermissions();
  const [error, setError] = useState<string | null>(null);

  const handleRefreshPermissions = async () => {
    try {
      setError(null);
      await refreshPermissions();
    } catch (err) {
      console.error("Error refreshing permissions:", err);
      setError("Erreur lors de la mise à jour des permissions");
    }
  };

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
