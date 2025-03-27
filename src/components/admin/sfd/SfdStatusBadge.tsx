
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sfd } from '../types/sfd-types';

interface SfdStatusBadgeProps {
  status?: Sfd['status'];
}

export function SfdStatusBadge({ status }: SfdStatusBadgeProps) {
  if (!status || status === 'active') {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
        Actif
      </Badge>
    );
  } else if (status === 'suspended') {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
        Suspendu
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
        En attente
      </Badge>
    );
  }
}
