
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, CreditCard, FileText, UserCheck, Phone } from 'lucide-react';
import ClientAccountDetails from '../client-accounts/ClientAccountDetails';
import ClientSavingsAccount from '../../sfd/ClientSavingsAccount';

interface ClientDetailsViewProps {
  client: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
    id_number?: string;
    id_type?: string;
    status: string;
    created_at: string;
    kyc_level?: number;
    notes?: string;
    sfd_id: string;
  };
  onClose: () => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <UserCheck className="mr-2 h-5 w-5 text-[#0D6A51]" />
          {client.full_name} 
          {client.phone && (
            <span className="ml-2 flex items-center text-sm font-normal text-gray-500">
              <Phone className="h-4 w-4 mr-1" />
              {client.phone}
            </span>
          )}
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Retour
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="account">
                <CreditCard className="h-4 w-4 mr-2" />
                Compte
              </TabsTrigger>
              <TabsTrigger value="info">
                <FileText className="h-4 w-4 mr-2" />
                Informations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <div className="space-y-4">
                <ClientAccountDetails 
                  clientId={client.id} 
                  clientName={client.full_name}
                  phone={client.phone}
                />
                <ClientSavingsAccount
                  clientId={client.id}
                  clientName={client.full_name}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Nom complet</h4>
                    <p className="text-gray-700">{client.full_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Email</h4>
                    <p className="text-gray-700">{client.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Téléphone</h4>
                    <p className="text-gray-700">{client.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Adresse</h4>
                    <p className="text-gray-700">{client.address || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Numéro d'identification</h4>
                    <p className="text-gray-700">{client.id_number || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Type d'identification</h4>
                    <p className="text-gray-700">{client.id_type || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Statut</h4>
                    <p className="text-gray-700">{client.status}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Niveau KYC</h4>
                    <p className="text-gray-700">{client.kyc_level || 0}</p>
                  </div>
                </div>
                
                {client.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-gray-700">{client.notes}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailsView;
