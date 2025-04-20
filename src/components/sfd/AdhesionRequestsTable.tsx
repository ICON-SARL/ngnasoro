
import React from 'react';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export interface AdhesionRequestsTableProps {
  requests: ClientAdhesionRequest[];
  isLoading: boolean;
  onRefresh?: (options?: RefetchOptions) => Promise<QueryObserverResult<ClientAdhesionRequest[], Error>>;
}

export function AdhesionRequestsTable({ requests, isLoading, onRefresh }: AdhesionRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="w-full p-4 border rounded-md">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune demande trouvée.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>
              <div className="flex flex-col">
                <span>{request.reference_number || 'N/A'}</span>
                <Badge variant="outline">{request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvée' : 'Rejetée'}</Badge>
              </div>
            </TableCell>
            <TableCell>{request.full_name}</TableCell>
            <TableCell>
              <div className="text-sm">
                {request.email && <div>{request.email}</div>}
                {request.phone && <div>{request.phone}</div>}
              </div>
            </TableCell>
            <TableCell>{formatDate(request.created_at)}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
