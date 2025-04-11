
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewClientForm } from '@/components/sfd/NewClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

interface ClientManagementProps {
  onSuccess?: () => void;
}

export const ClientManagement = ({ onSuccess }: ClientManagementProps) => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Amadou Diallo',
      email: 'amadou.diallo@example.com',
      phone: '+223 76 45 32 10',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Fatima Touré',
      email: 'fatima.toure@example.com',
      phone: '+223 77 12 34 56',
      status: 'inactive',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Ibrahim Keita',
      email: 'ibrahim.keita@example.com',
      phone: '+223 75 98 76 54',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );
  
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleAddClient = (newClient: any) => {
    // In a real app, this would be an API call
    const newClientWithId = {
      id: Date.now().toString(),
      ...newClient,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    setClients([...clients, newClientWithId]);
    setOpenDialog(false);
    
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
            </DialogHeader>
            <NewClientForm onSuccess={() => {
              if (onSuccess) onSuccess();
              setOpenDialog(false);
            }} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <Badge variant={
                        client.status === 'active' ? 'default' :
                        client.status === 'pending' ? 'outline' : 'secondary'
                      }>
                        {client.status === 'active' ? 'Actif' :
                         client.status === 'pending' ? 'En attente' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
