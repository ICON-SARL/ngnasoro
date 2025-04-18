import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSfdClients } from '@/hooks/useSfdClients';
import { NewClientForm } from './NewClientForm';
import ClientDetails from './ClientDetails';
import { useQueryClient } from '@tanstack/react-query';
import { 
  User, Search, Plus, Eye, Phone, Mail, 
  Clock, CheckCircle, XCircle, Filter 
} from 'lucide-react';
import { SfdClient } from '@/types/sfdClients';

export function ClientManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SfdClient | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Simuler une demande de refresh des statistiques du tableau de bord
  // quand ce composant est monté via useQueryClient
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);

  // Récupérer les données des clients depuis Supabase via le hook useSfdClients
  const { clients, isLoading, validateClient, rejectClient } = useSfdClients();

  // Filtrer les clients selon le terme de recherche
  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  // Filtrer les clients selon l'onglet actif
  const displayedClients = activeTab === 'all' 
    ? filteredClients 
    : filteredClients.filter(client => client.status === activeTab);

  // Afficher les détails d'un client
  const handleViewClient = (client: SfdClient) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  // Valider un compte client
  const handleValidateClient = (clientId: string) => {
    validateClient.mutate({ clientId });
  };

  // Rejeter un compte client
  const handleRejectClient = (clientId: string) => {
    rejectClient.mutate({ clientId });
  };

  // Obtenir un badge visuel selon le statut du client
  const getStatusBadge = (status: string) => {
    switch (status) {
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

  return (
    <Card>
      <CardContent className="p-6">
        {/* ... keep existing code (main JSX) the same ... */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Clients</h2>
            <Button 
              onClick={() => setIsNewClientDialogOpen(true)}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Client
            </Button>
          </div>
          
          <p className="text-muted-foreground">
            Ce module vous permet de gérer vos clients, de consulter leurs informations et de suivre leurs activités.
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all" className="flex items-center justify-center">
                <User className="h-4 w-4 mr-2" />
                Tous
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                En attente
              </TabsTrigger>
              <TabsTrigger value="validated" className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Validés
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center justify-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejetés
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <ClientsTable 
                clients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
                onValidateClient={handleValidateClient}
                onRejectClient={handleRejectClient}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <ClientsTable 
                clients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
                onValidateClient={handleValidateClient}
                onRejectClient={handleRejectClient}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            
            <TabsContent value="validated" className="mt-0">
              <ClientsTable 
                clients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
                onValidateClient={handleValidateClient}
                onRejectClient={handleRejectClient}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-0">
              <ClientsTable 
                clients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
                onValidateClient={handleValidateClient}
                onRejectClient={handleRejectClient}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
          
          {filteredClients.length > 10 && (
            <div className="flex justify-center mt-4">
              <Pagination />
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Dialogue Nouveau Client */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
          </DialogHeader>
          <NewClientForm onSuccess={() => setIsNewClientDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue Détails Client */}
      {selectedClient && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails du client</DialogTitle>
            </DialogHeader>
            <ClientDetails 
              client={selectedClient} 
              onDeleted={() => setIsDetailsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

interface ClientsTableProps {
  clients: SfdClient[];
  isLoading: boolean;
  onViewClient: (client: SfdClient) => void;
  onValidateClient: (clientId: string) => void;
  onRejectClient: (clientId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ 
  clients, 
  isLoading, 
  onViewClient, 
  onValidateClient, 
  onRejectClient,
  getStatusBadge 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center p-10 border border-dashed rounded-md">
        <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-muted-foreground mb-2">Aucun client trouvé</p>
        <p className="text-xs text-muted-foreground">Essayez de modifier vos filtres ou ajoutez un nouveau client</p>
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
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {client.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-1 text-gray-500" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-gray-500" />
                      <span>{client.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {client.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => onRejectClient(client.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Rejeter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => onValidateClient(client.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Valider
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => onViewClient(client)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Détails
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
