import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientList } from './ClientList';
import { useSfdClients } from '@/hooks/useSfdClients';
import { NewClientForm } from './NewClientForm';
import ClientDetails from './ClientDetails';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { AdhesionRequestsTable } from './AdhesionRequestsTable';
import { 
  User, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter 
} from 'lucide-react';

export function ClientManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SfdClient | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);

  const { clients, isLoading, validateClient, rejectClient } = useSfdClients();
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests 
  } = useClientAdhesions();

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const displayedClients = activeTab === 'all' 
    ? filteredClients 
    : filteredClients.filter(client => client.status === activeTab);

  const handleViewClient = (client: SfdClient) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  const handleValidateClient = (clientId: string) => {
    validateClient.mutate({ clientId });
  };

  const handleRejectClient = (clientId: string) => {
    rejectClient.mutate({ clientId });
  };

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
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestion des Clients</h2>
            <Button 
              onClick={() => setIsNewClientDialogOpen(true)}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <Plus className="h-4 w-4 mr-1" />
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
          
          <Tabs defaultValue="adhesions" className="mt-4">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="adhesions" className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Adhésions
                {adhesionRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {adhesionRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
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
            
            <TabsContent value="adhesions" className="mt-0">
              <AdhesionRequestsTable 
                requests={adhesionRequests} 
                isLoading={isLoadingAdhesionRequests}
              />
            </TabsContent>
            
            <TabsContent value="all" className="mt-0">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
            
            <TabsContent value="validated" className="mt-0">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-0">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
          </DialogHeader>
          <NewClientForm onSuccess={() => setIsNewClientDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
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

export default ClientManagement;
