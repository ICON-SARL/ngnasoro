
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientList } from './ClientList';
import { useSfdClients } from '@/hooks/useSfdClients';
import { NewClientForm } from './NewClientForm';
import ClientDetails from './ClientDetails';
import { 
  User, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter 
} from 'lucide-react';

const ClientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    clients, 
    isLoading
  } = useSfdClients();

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  // Filter clients based on active tab
  const displayedClients = activeTab === 'all' 
    ? filteredClients 
    : filteredClients.filter(client => client.status === activeTab);

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
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
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4">
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
            
            <TabsContent value="all" className="mt-6">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
            
            <TabsContent value="validated" className="mt-6">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              <ClientList 
                filteredClients={displayedClients} 
                isLoading={isLoading} 
                onViewClient={handleViewClient}
              />
            </TabsContent>
          </Tabs>
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
};

export default ClientsManagement;
