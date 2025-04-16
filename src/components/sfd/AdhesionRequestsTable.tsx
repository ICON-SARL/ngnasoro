
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { formatDate } from '@/utils/formatters';

interface AdhesionRequestsTableProps {
  requests: ClientAdhesionRequest[];
  isLoading: boolean;
  hideActions?: boolean;
  onApprove?: (request: ClientAdhesionRequest) => void;
  onReject?: (request: ClientAdhesionRequest) => void;
  onViewDetails?: (request: ClientAdhesionRequest) => void;
}

export function AdhesionRequestsTable({
  requests,
  isLoading,
  hideActions = false,
  onApprove,
  onReject,
  onViewDetails
}: AdhesionRequestsTableProps) {
  // Helper pour afficher le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeader>Nom complet</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Téléphone</TableHeader>
            <TableHeader>Date de demande</TableHeader>
            <TableHeader>Statut</TableHeader>
            {!hideActions && <TableHeader className="text-right">Actions</TableHeader>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hideActions ? 5 : 6} className="text-center py-8 text-muted-foreground">
                Aucune demande d'adhésion à afficher
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.full_name}</TableCell>
                <TableCell>{request.email || '-'}</TableCell>
                <TableCell>{request.phone || '-'}</TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                {!hideActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === 'pending' && onApprove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => onApprove(request)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === 'pending' && onReject && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onReject(request)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
