
import React from 'react';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, User } from 'lucide-react';

interface ClientListProps {
  filteredClients: any[];
  isLoading: boolean;
  onViewClient?: (client: any) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ 
  filteredClients, 
  isLoading,
  onViewClient 
}) => {
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

  if (isLoading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
    </div>;
  }

  if (filteredClients.length === 0) {
    return (
      <div className="text-center p-10 border border-dashed rounded-md">
        <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-xl text-gray-500 mb-3">Aucun client trouvé</p>
        <p className="text-sm text-gray-400">Essayez de modifier vos filtres ou ajoutez un nouveau client</p>
      </div>
    );
  }

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
        {filteredClients.map(client => (
          <TableRow key={client.id}>
            <TableCell>{client.full_name}</TableCell>
            <TableCell>{getStatusBadge(client.status)}</TableCell>
            <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewClient && onViewClient(client)}
              >
                <Eye className="mr-2 h-4 w-4" /> Détails
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
