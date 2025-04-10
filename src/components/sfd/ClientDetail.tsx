
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useClientDetails } from '@/hooks/useClientDetails';
import { Loader } from '@/components/ui/loader';
import ClientSavingsManagement from './ClientSavingsManagement';

export const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { client, isLoading } = useClientDetails(clientId as string);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Suspendu</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Client introuvable</h2>
        <p className="text-muted-foreground mb-4">Le client demandé n'existe pas ou a été supprimé.</p>
        <Button onClick={() => navigate('/sfd/clients')}>
          Retour à la liste des clients
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 font-montserrat">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/sfd/clients')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <h2 className="text-2xl font-bold">Détails du client</h2>
        {client.status && getStatusBadge(client.status)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b">
              <div className="bg-gray-100 rounded-full p-2">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{client.full_name}</p>
              </div>
            </div>
            
            {client.email && (
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="bg-gray-100 rounded-full p-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="bg-gray-100 rounded-full p-2">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            )}
            
            {client.address && (
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="bg-gray-100 rounded-full p-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              </div>
            )}
            
            {client.id_number && (
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pièce d'identité</p>
                  <p className="font-medium">{client.id_type || 'Pièce'}: {client.id_number}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="savings">
            <TabsList>
              <TabsTrigger value="savings">Compte Épargne</TabsTrigger>
              <TabsTrigger value="loans">Prêts</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="savings" className="pt-4">
              <ClientSavingsManagement 
                clientId={client.user_id || client.id}
                clientName={client.full_name}
                sfdId={client.sfd_id}
              />
            </TabsContent>
            
            <TabsContent value="loans" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prêts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun prêt actif pour ce client</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun document pour ce client</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
