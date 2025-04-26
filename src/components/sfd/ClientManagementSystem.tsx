
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, RefreshCw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import ClientDetailsView from './client-details/ClientDetailsView';
import ClientsList from './client-management/ClientsList';
import NewClientModal from './client-management/NewClientModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ClientManagementSystem = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    clients,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    totalClients,
    refetch
  } = useSfdClientManagement();

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Rafraîchissement',
      description: 'La liste des clients a été mise à jour',
    });
  };

  const handleClientSelect = (clientId: string) => {
    console.log("Client sélectionné:", clientId);
    setSelectedClientId(clientId);
  };

  const handleCloseClientDetails = () => {
    setSelectedClientId(null);
  };

  const handleClientCreated = () => {
    setIsNewClientModalOpen(false);
    refetch();
    toast({
      title: 'Client ajouté',
      description: 'Le nouveau client a été ajouté avec succès',
    });
  };

  const handleNewClientClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher le comportement par défaut
    e.stopPropagation(); // Arrêter la propagation de l'événement
    setIsNewClientModalOpen(true);
    console.log("Ouverture du modal nouveau client");
  };

  // Si un client est sélectionné, afficher ses détails
  if (selectedClientId) {
    const selectedClient = clients.find(client => client.id === selectedClientId);
    if (selectedClient) {
      return (
        <ClientDetailsView 
          client={selectedClient} 
          onClose={handleCloseClientDetails} 
        />
      );
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            Clients SFD 
            <Badge className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-300" variant="secondary">
              {totalClients}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefresh}
              className="h-9 w-9 p-0"
              title="Rafraîchir la liste"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={handleNewClientClick}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau Client
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un client..."
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select 
                value={statusFilter || ''} 
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="validated">Validés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ClientsList 
            clients={clients}
            isLoading={isLoading}
            onClientSelect={handleClientSelect}
          />
        </div>

        <NewClientModal 
          isOpen={isNewClientModalOpen}
          onClose={() => setIsNewClientModalOpen(false)}
          onClientCreated={handleClientCreated}
        />
      </CardContent>
    </Card>
  );
};

export default ClientManagementSystem;
