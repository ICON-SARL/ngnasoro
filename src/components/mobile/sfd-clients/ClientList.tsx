
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Phone, Mail, UserCheck, UserX } from 'lucide-react';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Skeleton } from '@/components/ui/skeleton';

const ClientList = () => {
  const navigate = useNavigate();
  const { clients, isLoading, validateClient, rejectClient } = useSfdClients();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  const handleValidate = async (clientId: string) => {
    await validateClient.mutateAsync({ clientId });
  };
  
  const handleReject = async (clientId: string) => {
    await rejectClient.mutateAsync({ clientId });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients SFD ({clients.length})</h2>
        <Button 
          onClick={() => navigate('/mobile-flow/client/new')}
          size="sm"
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <Plus className="h-4 w-4 mr-1" /> Nouveau
        </Button>
      </div>
      
      {clients.length === 0 ? (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Aucun client pour cette SFD.</p>
            <Button 
              className="mt-4 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/mobile-flow/client/new')}
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter un client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-1">{client.full_name}</CardTitle>
                    <CardDescription>{getStatusBadge(client.status)}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {client.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReject(client.id)}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Rejeter
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleValidate(client.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Valider
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {client.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-[#0D6A51]" 
                  onClick={() => navigate(`/mobile-flow/client/${client.id}`)}
                >
                  Voir les détails
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientList;
