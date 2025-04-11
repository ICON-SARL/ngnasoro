
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Define the PendingRequest type
interface PendingRequest {
  id: string;
  sfdName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  region: string;
}

interface PendingSubsidiesProps {
  pendingRequests: PendingRequest[];
  isLoading?: boolean;
}

export function PendingSubsidies({ pendingRequests, isLoading = false }: PendingSubsidiesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subventions en attente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subventions en attente</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <p className="text-muted-foreground">Aucune demande de subvention en attente.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SFD</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.sfdName}</TableCell>
                  <TableCell>{request.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{request.region}</TableCell>
                  <TableCell>
                    <Badge variant={request.status === 'pending' ? 'outline' : 
                                    request.status === 'approved' ? 'default' : 'destructive'}>
                      {request.status === 'pending' ? 'En attente' : 
                       request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
