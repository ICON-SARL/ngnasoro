
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { toast } from '@/hooks/use-toast';

export function SyncStatusIndicator() {
  const { 
    synchronizeWithSfd, 
    isSyncing, 
    lastSynced, 
    syncError,
    retryCount,
    testConnection 
  } = useRealtimeSynchronization();

  const handleSync = async () => {
    try {
      await synchronizeWithSfd();
      toast({
        title: "Synchronisation réussie",
        description: "Toutes les données ont été mises à jour"
      });
    } catch (error) {
      console.error("Sync error:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Badge 
            variant={syncError ? "destructive" : isSyncing ? "secondary" : "default"}
            className="animate-pulse"
          >
            {isSyncing ? "Synchronisation..." : 
             syncError ? "Erreur de synchronisation" : 
             "Synchronisé"}
          </Badge>
          {lastSynced && (
            <span className="text-sm text-muted-foreground">
              Dernière sync: {new Date(lastSynced).toLocaleString()}
            </span>
          )}
        </div>
        {syncError && (
          <p className="text-sm text-destructive mt-1">
            {syncError}
            {retryCount > 0 && ` (Tentative ${retryCount})`}
          </p>
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
          onClick={handleSync}
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
