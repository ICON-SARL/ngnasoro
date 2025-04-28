
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Eye } from 'lucide-react';
import { SfdClient } from '@/types/sfdClients';

interface ClientListProps {
  clients: SfdClient[];
  isLoading: boolean;
  status?: string;
  onViewClient?: (client: SfdClient) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ 
  clients,
  isLoading,
  status = 'all',
  onViewClient 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">
          {status === 'all' 
            ? "Aucun client trouvé" 
            : status === 'pending' 
            ? "Aucun client en attente de validation" 
            : "Aucun client validé"}
        </p>
      </div>
    );
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Validé</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Suspendu</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Code Client</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.client_code || "Non assigné"}</TableCell>
              <TableCell>{renderStatus(client.status)}</TableCell>
              <TableCell className="text-right">
                {onViewClient && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewClient(client)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Voir
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
