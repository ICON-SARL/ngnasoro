
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useClientAccountOperations } from '@/components/admin/hooks/sfd-client/useClientAccountOperations';
import { NewClientForm } from './NewClientForm';
import { 
  Search, 
  Plus, 
  UserCheck, 
  UserX, 
  FileText, 
  RefreshCw,
  CreditCard,
  Eye
} from 'lucide-react';

export const ClientManagementSystem = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { clients, isLoading, validateClient, rejectClient } = useSfdClients();
  
  // Filtrer les clients selon le terme de recherche et le statut
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm));
      
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Gestion des Clients</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          <Plus className="h-4 w-4 mr-1" />
          Nouveau Client
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative md:w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un client..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="md:w-1/2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Chargement des clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.full_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {client.email && <span className="text-xs">{client.email}</span>}
                      {client.phone && <span className="text-xs">{client.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(client.created_at || '').toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewClient(client.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir les détails</span>
                      </Button>

                      {client.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => rejectClient.mutate({ clientId: client.id })}
                          >
                            <UserX className="h-4 w-4" />
                            <span className="sr-only">Rejeter</span>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => validateClient.mutate({ clientId: client.id })}
                          >
                            <UserCheck className="h-4 w-4" />
                            <span className="sr-only">Valider</span>
                          </Button>
                        </>
                      )}

                      {client.status === 'validated' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleViewClient(client.id)}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="sr-only">Gérer</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
            <DialogDescription>
              Créez un compte client pour votre SFD
            </DialogDescription>
          </DialogHeader>
          <NewClientForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagementSystem;
