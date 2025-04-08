
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClients } from '@/hooks/useSfdClients';
import { toast } from '@/hooks/use-toast';
import { SfdClient } from '@/types/sfdClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewClientForm } from './NewClientForm';
import { ClientProfileEdit } from './ClientProfileEdit';
import { 
  Search, 
  UserPlus, 
  FileDown, 
  Edit2, 
  Trash2,
  Phone, 
  Mail, 
  User, 
  Filter,
  MoreVertical
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ClientManagementSystem = () => {
  const { user, activeSfdId, isAdmin } = useAuth();
  const { clients, isLoading, createClient, validateClient, rejectClient } = useSfdClients();
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [kycFilter, setKycFilter] = useState<number | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SfdClient | null>(null);
  
  // Filter clients based on search term and filters
  const filteredClients = clients.filter(client => {
    // Search term filter
    const matchesSearch = 
      !searchTerm || 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    // Status filter
    const matchesStatus = !statusFilter || client.status === statusFilter;
    
    // KYC level filter
    const matchesKyc = kycFilter === null || client.kyc_level === kycFilter;
    
    return matchesSearch && matchesStatus && matchesKyc;
  });
  
  // Handle client edit
  const handleEditClient = (client: SfdClient) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };
  
  // Handle client deletion (deactivation)
  const handleDeleteClient = (client: SfdClient) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm deactivation
  const confirmDeactivation = async () => {
    if (!selectedClient) return;
    
    try {
      // In a real implementation, this would call an API endpoint to deactivate the client
      // For now, we'll use the reject function as a placeholder
      await rejectClient.mutateAsync({ clientId: selectedClient.id });
      toast({
        title: "Client désactivé",
        description: "Le client a été désactivé avec succès",
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deactivating client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de désactiver le client",
        variant: "destructive",
      });
    }
  };
  
  // Export clients data
  const exportClientData = () => {
    // Create CSV content
    const headers = ["Nom Complet", "Email", "Téléphone", "Adresse", "Statut", "Niveau KYC"];
    const csvData = [
      headers.join(","),
      ...filteredClients.map(client => [
        client.full_name,
        client.email || "",
        client.phone || "",
        client.address || "",
        client.status,
        client.kyc_level
      ].map(value => `"${value}"`).join(","))
    ].join("\n");
    
    // Create and download the CSV file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_sfd_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées au format CSV",
    });
  };
  
  // Render KYC level as a progress bar
  const renderKycLevel = (level: number) => {
    const percentage = (level / 3) * 100;
    return (
      <div className="flex items-center space-x-2">
        <Progress value={percentage} className="h-2 w-32" />
        <span className="text-xs text-muted-foreground">{level}/3</span>
      </div>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Inactif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button onClick={() => setIsNewClientModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un Client
        </Button>
      </div>
      
      {/* Filters and search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Clients SFD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Rechercher un client..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="validated">Actif</SelectItem>
                  <SelectItem value="rejected">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => setKycFilter(value === "all" ? null : parseInt(value))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Niveau KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="0">Niveau 0</SelectItem>
                  <SelectItem value="1">Niveau 1</SelectItem>
                  <SelectItem value="2">Niveau 2</SelectItem>
                  <SelectItem value="3">Niveau 3</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={exportClientData}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
          
          {/* Client Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nom Complet</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Niveau KYC</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Chargement des clients...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <User className="h-12 w-12 text-gray-300 mb-2" />
                        <p>Aucun client trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              <span>{client.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate max-w-[200px]">
                                {client.address || 'Non renseigné'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {client.address || 'Adresse non renseignée'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{renderStatusBadge(client.status)}</TableCell>
                      <TableCell>{renderKycLevel(client.kyc_level)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          {client.status !== 'rejected' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteClient(client)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Désactiver</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* New Client Modal */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
            <DialogDescription>
              Complétez le formulaire pour créer un nouveau client SFD
            </DialogDescription>
          </DialogHeader>
          <NewClientForm onSuccess={() => setIsNewClientModalOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Modal */}
      {selectedClient && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            <ClientProfileEdit 
              client={selectedClient} 
              onSuccess={() => setIsEditModalOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete (Deactivate) Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désactiver le client</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver ce client ? Cette action changera son statut à "inactif".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeactivation}>
              Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
