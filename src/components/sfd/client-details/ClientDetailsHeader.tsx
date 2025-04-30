
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, X } from 'lucide-react';
import { ClientStatusBadge } from '../ClientStatusBadge';

interface ClientDetailsHeaderProps {
  client: any;
  onClose: () => void;
}

export function ClientDetailsHeader({ client, onClose }: ClientDetailsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{client.full_name}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {client.email && <span>{client.email}</span>}
            {client.email && client.phone && <span>•</span>}
            {client.phone && <span>{client.phone}</span>}
          </div>
          {client.status && (
            <div className="mt-1">
              <ClientStatusBadge status={client.status} />
            </div>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
