
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, UserCheck, UserX, Loader2, Users } from 'lucide-react';

interface ClientListProps {
  clients: SfdClient[];
  isLoading: boolean;
  status?: 'all' | 'pending' | 'validated' | 'rejected';
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  isLoading,
  status = 'all'
}) => {
  // Get clients filtered by status if specified
  const filteredClients = status === 'all'
    ? clients
    : clients.filter(client => client.status === status);

  const getStatusBadge = (clientStatus: string) => {
    switch (clientStatus) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2">Chargement des clients...</span>
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <Card className="text-center p-8">
        <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun client trouvé</h3>
        <p className="text-gray-500">
          {status === 'all' 
            ? "Vous n'avez pas encore de clients."
            : status === 'pending'
              ? "Aucun client en attente."
              : "Aucun client validé."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredClients.map(client => (
        <Card key={client.id} className="overflow-hidden hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{client.full_name}</h3>
                  {getStatusBadge(client.status)}
                  {client.client_code && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {client.client_code}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4">
                  {client.email && (
                    <span>{client.email}</span>
                  )}
                  {client.phone && (
                    <span>{client.phone}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {client.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Valider
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                      <UserX className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
