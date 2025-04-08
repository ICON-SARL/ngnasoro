
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SfdStatusBadgeProps {
  status: string;
}

export function SfdStatusBadge({ status }: SfdStatusBadgeProps) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          Active
        </Badge>
      );
    case 'suspended':
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Suspendue
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          En attente
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
