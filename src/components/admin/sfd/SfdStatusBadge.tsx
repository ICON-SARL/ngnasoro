
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sfd } from '../types/sfd-types';
import { cn } from '@/lib/utils';

interface SfdStatusBadgeProps {
  status?: Sfd['status'];
  className?: string; // Added className prop
  variant?: 'default' | 'destructive' | 'outline'; // Added variant prop
}

export function SfdStatusBadge({ status, className, variant }: SfdStatusBadgeProps) {
  if (!status || status === 'active') {
    return (
      <Badge 
        variant={variant} 
        className={cn("bg-green-100 text-green-700 hover:bg-green-200", className)}
      >
        Actif
      </Badge>
    );
  } else if (status === 'suspended') {
    return (
      <Badge 
        variant={variant}
        className={cn("bg-red-100 text-red-700 hover:bg-red-200", className)}
      >
        Suspendu
      </Badge>
    );
  } else {
    return (
      <Badge 
        variant={variant}
        className={cn("bg-yellow-100 text-yellow-700 hover:bg-yellow-200", className)}
      >
        En attente
      </Badge>
    );
  }
}
