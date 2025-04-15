
import React from 'react';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export const ClientList: React.FC = () => {
  const { clients } = useSfdClients();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs">En attente</span>;
      case 'validated':
        return <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">Validés</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs">Rejetés</span>;
      default:
        return <span className="bg-gray-50 text-gray-700 px-2 py-1 rounded-full text-xs">Inconnu</span>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date d'adhésion</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map(client => (
          <TableRow key={client.id}>
            <TableCell>{client.full_name}</TableCell>
            <TableCell>{getStatusBadge(client.status)}</TableCell>
            <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" /> Détails
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
