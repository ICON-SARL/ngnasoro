
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, CreditCard, FileText, UserCheck, Phone, Mail, User, Home, FileDigit, Calendar } from 'lucide-react';
import ClientAccountDetails from '../client-accounts/ClientAccountDetails';
import ClientSavingsAccount from '../../sfd/ClientSavingsAccount';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SfdClient } from '@/types/sfdClients';
import { motion } from 'framer-motion';

interface ClientDetailsViewProps {
  client: SfdClient;
  onClose: () => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onClose }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspendu</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Validé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center">
            <User className="h-6 w-6 mr-2 text-[#0D6A51]" />
            <h2 className="text-2xl font-semibold">{client.full_name}</h2>
            {getStatusBadge(client.status)}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-y-1 md:gap-x-4 mt-2 text-gray-500">
            {client.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">Inscription: {format(new Date(client.created_at), 'PPP', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow">
        <CardContent className="p-6">
          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="account" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Compte
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Informations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <div className="space-y-4">
                <ClientAccountDetails 
                  clientId={client.id} 
                  clientName={client.full_name}
                />
                <ClientSavingsAccount
                  clientId={client.id}
                  clientName={client.full_name}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2 text-[#0D6A51]" />
                        Informations personnelles
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Nom complet</h4>
                          <p className="text-gray-700 font-medium">{client.full_name}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Email</h4>
                          <p className="text-gray-700">{client.email || 'Non renseigné'}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                          <p className="text-gray-700">{client.phone || 'Non renseigné'}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Adresse</h4>
                          <p className="text-gray-700">{client.address || 'Non renseignée'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <FileDigit className="h-5 w-5 mr-2 text-[#0D6A51]" />
                        Identification
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Type d'identification</h4>
                          <p className="text-gray-700">{client.id_type || 'Non renseigné'}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Numéro d'identification</h4>
                          <p className="text-gray-700">{client.id_number || 'Non renseigné'}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Niveau KYC</h4>
                          <p className="text-gray-700">{client.kyc_level || 0}/3</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                          <div>{getStatusBadge(client.status)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {client.notes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Notes</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-gray-700 whitespace-pre-line">{client.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClientDetailsView;
