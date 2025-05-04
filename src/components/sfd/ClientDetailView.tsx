
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClientDetails } from '@/hooks/useSfdClientDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, File, CreditCard, Shield, BadgeCheck, BarChart3 } from 'lucide-react';
import ClientDocuments from './ClientDocuments';
import ClientSavingsAccountView from './ClientSavingsAccountView';

const ClientDetailView = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { activeSfdId } = useAuth();
  const { client, isLoading, error } = useSfdClientDetails(clientId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-800">Client non trouvé</h2>
        <p className="text-gray-600 mt-2">
          {error || "Impossible de charger les détails du client."}
        </p>
        <Button 
          variant="outline"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{client.full_name}</h1>
          <p className="text-gray-500">
            {client.email || 'Email non défini'} • {client.phone || 'Téléphone non défini'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Client Status Badge */}
      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" 
        style={{
          backgroundColor: 
            client.status === 'validated' ? '#DCFCE7' :
            client.status === 'rejected' ? '#FECDD3' :
            client.status === 'suspended' ? '#FEF3C7' : '#E5E7EB',
          color: 
            client.status === 'validated' ? '#16A34A' :
            client.status === 'rejected' ? '#E11D48' :
            client.status === 'suspended' ? '#D97706' : '#6B7280'
        }}
      >
        {client.status === 'validated' && <BadgeCheck className="mr-1 h-3 w-3" />}
        {client.status === 'validated' ? 'Validé' :
         client.status === 'rejected' ? 'Rejeté' :
         client.status === 'suspended' ? 'Suspendu' : 'En attente'}
      </div>

      {/* Client Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <File className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Compte Épargne
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Activités
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Information personnelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nom complet</h4>
                  <p className="mt-1">{client.full_name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1">{client.email || 'Non défini'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                  <p className="mt-1">{client.phone || 'Non défini'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Adresse</h4>
                  <p className="mt-1">{client.address || 'Non définie'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Numéro d'identification</h4>
                  <p className="mt-1">{client.id_number || 'Non défini'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type d'identification</h4>
                  <p className="mt-1">{client.id_type || 'Non défini'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Niveau KYC</h4>
                  <p className="mt-1">{client.kyc_level}/3</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-1">{client.notes || 'Aucune note'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <ClientDocuments clientId={clientId as string} />
        </TabsContent>
        
        <TabsContent value="savings">
          <ClientSavingsAccountView 
            clientId={clientId as string} 
            clientName={client.full_name}
            sfdId={activeSfdId || client.sfd_id} 
          />
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Historique des activités</CardTitle>
            </CardHeader>
            <CardContent>
              {/* We'll implement this in a future update */}
              <p className="text-center py-6 text-gray-500">Fonctionnalité à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailView;
