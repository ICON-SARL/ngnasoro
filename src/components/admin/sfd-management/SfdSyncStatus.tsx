
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { useSfdSynchronization } from '@/hooks/sfd/useSfdSynchronization';
import { Badge } from "@/components/ui/badge";

interface SfdSyncStatusProps {
  sfdId: string;
}

export function SfdSyncStatus({ sfdId }: SfdSyncStatusProps) {
  const { 
    synchronizeWithSfd, 
    testConnection, 
    isSyncing, 
    lastSyncedAt,
    syncError 
  } = useSfdSynchronization(sfdId);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Badge variant={syncError ? "destructive" : "secondary"}>
            {syncError ? "Erreur de synchronisation" : "Synchronisé"}
          </Badge>
          {lastSyncedAt && (
            <span className="text-sm text-muted-foreground">
              Dernière sync: {lastSyncedAt.toLocaleDateString()}
            </span>
          )}
        </div>
        {syncError && (
          <p className="text-sm text-destructive mt-1">{syncError}</p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isSyncing}
          onClick={() => testConnection()}
        >
          <WifiOff className="h-4 w-4 mr-2" />
          Tester la connexion
        </Button>
        
        <Button
          variant="default"
          size="sm"
          disabled={isSyncing}
          onClick={() => synchronizeWithSfd()}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Synchroniser
        </Button>
      </div>
    </div>
  );
}
