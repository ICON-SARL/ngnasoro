
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SfdHeaderProps {
  isLoading: boolean;
  isRetrying: boolean;
  isOnline: boolean;
  selectedSfd: any;
  onRefresh: () => void;
  onAddSfd: () => void;
  onAddAdmin: () => void;
}

export function SfdHeader({ 
  isLoading, 
  isRetrying, 
  isOnline, 
  selectedSfd, 
  onRefresh, 
  onAddSfd, 
  onAddAdmin 
}: SfdHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Gestion des SFDs</h1>
        <p className="text-sm text-muted-foreground">
          Administration centrale des institutions de microfinance partenaires
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          className="gap-2"
          disabled={isLoading || isRetrying || !isOnline}
        >
          {(isLoading || isRetrying) ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Actualiser
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onAddSfd}
          disabled={!isOnline}
        >
          <Plus className="h-4 w-4" />
          Nouvelle SFD
        </Button>
        <Button 
          onClick={onAddAdmin}
          className="gap-2"
          disabled={!selectedSfd || !isOnline}
        >
          <UserPlus className="h-4 w-4" />
          Ajouter un Admin SFD
        </Button>
      </div>
    </div>
  );
}
