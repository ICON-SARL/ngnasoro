
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SfdClient } from '@/types/sfdClients';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Calendar, 
  CreditCard,
  Book,
  History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ClientAccountDetails from '../client-accounts/ClientAccountDetails';

interface ClientDetailsViewProps {
  client: SfdClient;
  onClose: () => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Suspendu</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Validé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Client header with basic info */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-[#0D6A51]/10 h-12 w-12 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-[#0D6A51]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{client.full_name}</h2>
            <div className="flex items-center text-gray-500 text-sm">
              {getStatusBadge(client.status)}
              <span className="mx-2">•</span>
              <span>Client depuis {client.created_at ? format(new Date(client.created_at), 'MMM yyyy', { locale: fr }) : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 self-end md:self-start">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
          >
            Retour
          </Button>
        </div>
      </div>

      {/* Tabs for different client sections */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="account">
            <CreditCard className="h-4 w-4 mr-2" />
            Compte
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white p-4 rounded-md border">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Informations personnelles
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{client.full_name}</p>
                </div>
                
                {client.email && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      Email
                    </p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                )}
                
                {client.phone && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      Téléphone
                    </p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                )}
                
                {client.address && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      Adresse
                    </p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Information */}
            <div className="bg-white p-4 rounded-md border">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Informations KYC
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Type de pièce d'identité</p>
                  <p className="font-medium">{client.id_type || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Numéro de pièce</p>
                  <p className="font-medium">{client.id_number || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    Date de validation
                  </p>
                  <p className="font-medium">
                    {client.validated_at 
                      ? format(new Date(client.validated_at), 'PPP', { locale: fr })
                      : 'Non validé'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Niveau KYC</p>
                  <div className="mt-1">
                    <Badge variant={client.kyc_level >= 2 ? "default" : "outline"}>
                      Niveau {client.kyc_level || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="bg-white p-4 rounded-md border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Book className="h-5 w-5 mr-2 text-gray-500" />
                Notes
              </h3>
              <p className="text-gray-700">{client.notes}</p>
            </div>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="pt-4">
          <ClientAccountDetails 
            clientId={client.id}
            clientName={client.full_name}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="pt-4">
          <div className="bg-white p-6 rounded-md border text-center">
            <History className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">Historique des activités</h3>
            <p className="text-gray-500 mt-1">
              L'historique des activités de ce client sera affiché ici.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailsView;
