
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building, ArrowRight } from 'lucide-react';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export function CurrentSfdBadge() {
  const { sfdData, isLoading, activeSfdId } = useSfdDataAccess();
  const { isSfdAdmin } = useAuth();

  if (!isSfdAdmin) {
    return null;
  }

  // Trouver la SFD active dans les données
  const activeSfd = sfdData.find(sfd => sfd.id === activeSfdId);

  if (isLoading) {
    return <Skeleton className="h-8 w-32" />;
  }

  if (!activeSfd) {
    return (
      <Badge variant="outline" className="px-3 py-1 text-yellow-600 bg-yellow-50 border-yellow-200">
        <Building className="h-3.5 w-3.5 mr-1" />
        Aucune SFD sélectionnée
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="px-3 py-1.5 text-primary bg-primary/10 border-primary/20">
      <Building className="h-3.5 w-3.5 mr-1" />
      <span className="font-medium">{activeSfd.name || activeSfd.code}</span>
      {activeSfd.region && (
        <>
          <ArrowRight className="h-3 w-3 mx-1 opacity-50" />
          <span className="text-xs opacity-80">{activeSfd.region}</span>
        </>
      )}
    </Badge>
  );
}
