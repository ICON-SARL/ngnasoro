
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, RefreshCw, ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import ClientDetailsView from './client-details/ClientDetailsView';
import ClientsList from './client-management/ClientsList';
import NewClientModal from './client-management/NewClientModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/pagination';

export const ClientManagementSystem = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [clientViewError, setClientViewError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  const {
    clients,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    totalClients,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages
  } = useSfdClientManagement();

  // For debugging
  useEffect(() => {
    console.log("ClientManagementSystem - Current user role:", userRole);
    console.log("ClientManagementSystem - Clients loaded:", clients?.length);
  }, [userRole, clients]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Rafraîchissement',
      description: 'La liste des clients a été mise à jour',
    });
  };

  const handleClientSelect = (clientId: string) => {
    console.log("Client sélectionné:", clientId);
    
    // Find the client in the loaded data
    const selectedClient = clients?.find(client => client.id === clientId);
    
    if (selectedClient) {
      setSelectedClientId(clientId);
      setClientViewError(null);
    } else {
      console.error("Client non trouvé dans les données chargées:", clientId);
      toast({
        title: "Erreur",
        description: "Client non trouvé dans les données chargées",
        variant: "destructive",
      });
      setClientViewError("Client non trouvé");
    }
  };

  const handleCloseClientDetails = () => {
    setSelectedClientId(null);
    setClientViewError(null);
  };

  const handleClientCreated = () => {
    setIsNewClientModalOpen(false);
    refetch();
    toast({
      title: 'Client ajouté',
      description: 'Le nouveau client a été ajouté avec succès',
      variant: 'default',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewClientClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsNewClientModalOpen(true);
    
    console.log("Ouverture du modal nouveau client");
  };

  // Si un client est sélectionné, afficher ses détails
  if (selectedClientId) {
    const selectedClient = clients?.find(client => client.id === selectedClientId);
    
    if (clientViewError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-red-50 border border-red-200 rounded-md"
        >
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-700">{clientViewError}</p>
          <Button 
            variant="outline" 
            onClick={handleCloseClientDetails} 
            className="mt-2"
          >
            Retour à la liste
          </Button>
        </motion.div>
      );
    }
    
    if (selectedClient) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key="client-details"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={handleCloseClientDetails}
                  className="mr-2 p-2 h-9 w-9"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl">
                  Détails du client
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ClientDetailsView 
                client={selectedClient} 
                onClose={handleCloseClientDetails} 
              />
            </CardContent>
          </Card>
        </motion.div>
      );
    }
    
    // Fallback if client not found
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-amber-50 border border-amber-200 rounded-md"
      >
        <h3 className="text-amber-800 font-medium text-lg">Client non trouvé</h3>
        <p className="text-amber-700 mt-2">
          Le client demandé n'a pas pu être trouvé. Il a peut-être été supprimé ou vos permissions ont changé.
        </p>
        <Button 
          variant="outline" 
          onClick={handleCloseClientDetails} 
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        key="client-list"
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CardTitle className="text-xl flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[#0D6A51]" />
                  Clients SFD 
                </CardTitle>
                <Badge className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-300" variant="secondary">
                  {totalClients}
                </Badge>
              </div>
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
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 shadow-sm"
                  type="button"
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
                    placeholder="Rechercher par nom, email ou téléphone..."
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
                      <SelectItem value="suspended">Suspendus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ClientsList 
                clients={clients || []}
                isLoading={isLoading}
                onClientSelect={handleClientSelect}
              />
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                  />
                </div>
              )}
            </div>

            <NewClientModal 
              isOpen={isNewClientModalOpen}
              onClose={() => setIsNewClientModalOpen(false)}
              onClientCreated={handleClientCreated}
            />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientManagementSystem;
