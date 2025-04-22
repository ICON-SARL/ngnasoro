
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
import { SfdClient } from '@/types/sfdClients';
import { Eye, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientsListProps {
  clients: SfdClient[];
  isLoading: boolean;
  onClientSelect: (clientId: string) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ 
  clients, 
  isLoading,
  onClientSelect
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Suspendu</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Validé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground border rounded-md">
        <Users className="h-8 w-8 mb-2" />
        <h3 className="font-medium">Aucun client trouvé</h3>
        <p className="text-sm">Ajoutez de nouveaux clients ou modifiez votre recherche</p>
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
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map(client => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {client.phone && <span className="text-sm">{client.phone}</span>}
                  {client.email && <span className="text-xs text-muted-foreground">{client.email}</span>}
                </div>
              </TableCell>
              <TableCell>
                {client.created_at && format(new Date(client.created_at), 'P', { locale: fr })}
              </TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onClientSelect(client.id)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Gérer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsList;
