
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ClientStatusBadgeProps {
  status: string;
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'validated':
        return {
          label: 'Validé',
          variant: 'success',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'rejected':
        return {
          label: 'Rejeté',
          variant: 'destructive',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'suspended':
        return {
          label: 'Suspendu',
          variant: 'warning',
          icon: AlertCircle,
          className: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'pending':
      default:
        return {
          label: 'En attente',
          variant: 'outline',
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };
  
  const { label, className, icon: Icon } = getStatusConfig();
  
  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
