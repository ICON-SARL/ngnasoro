
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ClientDetails } from '@/components/sfd/ClientDetails';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

export const ClientsManagement = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for clients
  const clients: Client[] = [
    {
      id: '1',
      name: 'Amadou Diallo',
      email: 'amadou.diallo@example.com',
      phone: '+223 76 00 00 01',
      address: 'Bamako, Mali',
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Fatima Touré',
      email: 'fatima.toure@example.com',
      phone: '+223 76 00 00 02',
      address: 'Sikasso, Mali',
      status: 'pending',
      createdAt: '2024-02-20T00:00:00.000Z'
    },
    {
      id: '3',
      name: 'Ibrahim Keita',
      email: 'ibrahim.keita@example.com',
      phone: '+223 76 00 00 03',
      address: 'Kayes, Mali',
      status: 'inactive',
      createdAt: '2024-03-10T00:00:00.000Z'
    }
  ];

  // Filter clients based on search query
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des clients</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>+ Ajouter un client</Button>
          </div>
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
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
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
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Détails du client</DialogTitle>
                        </DialogHeader>
                        {selectedClient && (
                          <ClientDetails client={selectedClient} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
