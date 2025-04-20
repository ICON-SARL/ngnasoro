
import React, { useState } from 'react';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import LoadingIndicator from '@/components/ui/loading-indicator';

export default function ClientsPage() {
  const { clients = [], isLoading, refetch } = useSfdClients();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Safely filter clients with null check
  const filteredClients = clients ? clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  ) : [];
  
  if (isLoading) {
    return (
      <SfdAdminLayout>
        <div className="p-6">
          <LoadingIndicator message="Chargement des clients..." />
        </div>
      </SfdAdminLayout>
    );
  }

  // Log debugging information
  console.log('Clients data:', clients);
  
  return (
    <SfdAdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Gérez les clients de votre SFD</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Liste des clients</CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {filteredClients.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>Aucun client trouvé</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom complet</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={client.status === 'validated' ? 'default' : 'outline'}
                            className={client.status === 'validated' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {client.status === 'validated' ? 'Actif' : 'En attente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(client.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SfdAdminLayout>
  );
}
