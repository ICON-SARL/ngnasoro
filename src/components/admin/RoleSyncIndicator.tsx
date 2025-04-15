
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useRolesSynchronization } from '@/hooks/useRolesSynchronization';

export function RoleSyncIndicator() {
  const { syncing, synchronizeRoles } = useRolesSynchronization();

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={synchronizeRoles}
      disabled={syncing}
    >
      {syncing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Synchronisation...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Synchroniser les rôles
        </>
      )}
    </Button>
  );
}
