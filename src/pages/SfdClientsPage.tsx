
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  FileText, 
  PhoneCall, 
  Mail, 
  MapPin, 
  User 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  kyc_level: number;
  created_at: string;
}

const SfdClientsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get the active SFD for this user
        const { data: sfdData } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();
        
        if (sfdData) {
          setActiveSfdId(sfdData.sfd_id);
          
          // Fetch clients for this SFD
          let query = supabase
            .from('sfd_clients')
            .select('*')
            .eq('sfd_id', sfdData.sfd_id);
          
          if (searchTerm) {
            query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
          }
          
          const { data, error } = await query.order('created_at', { ascending: false });
          
          if (error) throw error;
          setClients(data as Client[]);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [user, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800">Validé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKycLevelBadge = (level: number) => {
    switch (level) {
      case 0:
        return <Badge variant="outline" className="bg-gray-100">KYC Niveau 0</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">KYC Niveau 1</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-green-100 text-green-800">KYC Niveau 2</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">KYC Niveau 3</Badge>;
      default:
        return <Badge variant="outline">KYC Niveau {level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un Client
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Clients SFD</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un client..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Niveau KYC</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <User className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">Aucun client trouvé</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.phone && (
                              <div className="flex items-center text-sm">
                                <PhoneCall className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                {client.phone}
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.address && (
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                              {client.address}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>{getKycLevelBadge(client.kyc_level)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdClientsPage;
