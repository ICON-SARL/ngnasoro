import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { Eye, Search, ArrowUpDown, Users } from 'lucide-react';
import ClientDetailsView from './client-details/ClientDetailsView';
import { useNavigate } from 'react-router-dom';

export const ClientsTable: React.FC = () => {
  const { activeSfdId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { data: clients, isLoading } = useQuery({
    queryKey: ['sfd-clients', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeSfdId
  });
  
  const filteredClients = clients?.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/sfd-clients/${clientId}`);
  };
  
  if (selectedClient) {
    return (
      <ClientDetailsView 
        client={selectedClient} 
        onClose={() => setSelectedClient(null)} 
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader size="lg" />
        </div>
      ) : filteredClients?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold">Aucun client trouvé</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? "Essayez avec d'autres termes de recherche" : "Vous n'avez encore aucun client"}
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'adhésion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.full_name}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    {client.created_at ? format(new Date(client.created_at), 'dd/MM/yyyy', { locale: fr }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewClient(client.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
