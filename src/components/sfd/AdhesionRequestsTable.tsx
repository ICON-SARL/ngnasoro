
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientAdhesionRequest } from '@/types/sfdClients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface AdhesionRequestsTableProps {
  requests: ClientAdhesionRequest[];
  isLoading: boolean;
}

export function AdhesionRequestsTable({ requests, isLoading }: AdhesionRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Chargement des demandes...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Aucune demande trouvée</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom complet</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date de demande</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.full_name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {request.email}<br />
                  {request.phone}
                </div>
              </TableCell>
              <TableCell>{formatDate(request.created_at)}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    request.status === 'approved' ? 'default' : 
                    request.status === 'rejected' ? 'destructive' : 
                    'outline'
                  }
                >
                  {request.status === 'approved' ? 'Approuvé' : 
                   request.status === 'rejected' ? 'Rejeté' : 
                   'En attente'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  {request.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
