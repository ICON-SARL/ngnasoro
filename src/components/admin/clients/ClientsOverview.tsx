
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Search, UserPlus, Users } from 'lucide-react';

const ClientsOverview: React.FC = () => {
  const { activeSfdId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // This would typically fetch clients data from your API
  const clients = [
    // Sample data - replace with real API calls
    { id: 1, name: 'Jean Dupont', status: 'active', date: '2023-05-15', balance: 250000 },
    { id: 2, name: 'Marie Koffi', status: 'pending', date: '2023-06-22', balance: 120000 },
    { id: 3, name: 'Ahmed Diallo', status: 'active', date: '2023-04-10', balance: 350000 },
  ];

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Clients SFD</CardTitle>
            <Button size="sm" className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un client..."
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Clients list */}
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b bg-muted/50">
                <div>Nom</div>
                <div>Statut</div>
                <div>Date d'adhésion</div>
                <div>Solde</div>
                <div className="text-right">Actions</div>
              </div>
              
              {filteredClients.length > 0 ? (
                <div className="divide-y">
                  {filteredClients.map(client => (
                    <div key={client.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                      <div className="font-medium">{client.name}</div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {client.status === 'active' ? 'Actif' : 'En attente'}
                        </span>
                      </div>
                      <div className="text-muted-foreground">{client.date}</div>
                      <div>{client.balance.toLocaleString()} FCFA</div>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">Voir</Button>
                        <Button size="sm" variant="outline">Éditer</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <Users className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Aucun client trouvé</h3>
                  <p className="text-sm">Ajoutez de nouveaux clients ou modifiez votre recherche</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsOverview;
