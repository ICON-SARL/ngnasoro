
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Ban, Clock, AlertCircle } from 'lucide-react';

interface SfdStatusBadgeProps {
  status: string;
}

export function SfdStatusBadge({ status }: SfdStatusBadgeProps) {
  switch (status) {
    case 'active':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </Badge>
      );
    case 'suspended':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
          <Ban className="h-3 w-3 mr-1" />
          Suspendu
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-50">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 hover:bg-gray-50">
          <AlertCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
  }
}
