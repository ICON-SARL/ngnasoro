
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClientsManagement } from '@/hooks/useSfdClientsManagement';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, Loader2 } from 'lucide-react';
import NewClientModal from '@/components/sfd/client-management/NewClientModal';

const ClientsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId } = useAuth();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  
  const { 
    clients, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    refetch
  } = useSfdClientsManagement();

  const filteredClients = clients || [];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Clients SFD</CardTitle>
            <Button 
              size="sm" 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => setIsNewClientModalOpen(true)}
            >
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b bg-muted/50">
                  <div>Nom</div>
                  <div>Statut</div>
                  <div>Date d'adhésion</div>
                  <div>Email</div>
                  <div className="text-right">Actions</div>
                </div>
                
                {filteredClients.length > 0 ? (
                  <div className="divide-y">
                    {filteredClients.map((client: any) => (
                      <div key={client.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                        <div className="font-medium">{client.full_name}</div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : client.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {client.status === 'active' ? 'Actif' : client.status === 'pending' ? 'En attente' : 'Inactif'}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(client.created_at || '').toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-muted-foreground">{client.email || '-'}</div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/sfd-clients/${client.id}`)}
                          >
                            Voir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/sfd-clients/${client.id}`)}
                          >
                            Éditer
                          </Button>
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
            )}
          </div>
        </CardContent>
      </Card>
      
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={() => {
          refetch();
          setIsNewClientModalOpen(false);
        }}
      />
    </>
  );
};

export default ClientsOverview;
