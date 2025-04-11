
import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewClientForm } from './NewClientForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search } from 'lucide-react';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  kyc_level: number;
}

export const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Simulate API call with mock data
        setTimeout(() => {
          const mockClients: Client[] = [
            {
              id: '1',
              full_name: 'Amadou Diallo',
              email: 'amadou.diallo@example.com',
              phone: '+223 76 00 00 01',
              status: 'active',
              kyc_level: 2
            },
            {
              id: '2',
              full_name: 'Fatoumata Coulibaly',
              email: 'fatoumata.c@example.com',
              phone: '+223 76 00 00 02',
              status: 'pending',
              kyc_level: 1
            },
            {
              id: '3',
              full_name: 'Ibrahim Keita',
              email: 'ibrahim.keita@example.com',
              phone: '+223 76 00 00 03',
              status: 'inactive',
              kyc_level: 0
            }
          ];
          
          setClients(mockClients);
          setFilteredClients(mockClients);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddClientSuccess = () => {
    // Close dialog and refresh client list
    setDialogOpen(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des Clients</CardTitle>
        <CardDescription>
          Gérez vos clients et leur information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter un client</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau client</DialogTitle>
                <DialogDescription>
                  Complétez le formulaire ci-dessous pour créer un nouveau client
                </DialogDescription>
              </DialogHeader>
              <NewClientForm onSuccess={handleAddClientSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun client trouvé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Niveau KYC</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {client.status === 'active' ? 'Actif' : 
                           client.status === 'pending' ? 'En attente' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell>Niveau {client.kyc_level}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">
                          Détails
                        </Button>
                        <Button variant="outline" size="sm">
                          Éditer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
