
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdhesionRequests } from '@/hooks/useAdhesionRequests';
import { formatDate } from '@/utils/formatters';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export function AdhesionRequestList() {
  const { requests, isLoading, fetchRequests } = useAdhesionRequests();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-50 text-green-700">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700">Rejetée</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes d'adhésion</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Profession</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.reference_number}</TableCell>
                <TableCell>{request.full_name}</TableCell>
                <TableCell>{request.profession}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {request.email && <div>{request.email}</div>}
                    {request.phone && <div>{request.phone}</div>}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
