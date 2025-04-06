
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Calendar, FileText, Shield } from 'lucide-react';

interface ClientDetailsProps {
  client: SfdClient;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
  return (
    <div className="space-y-4 py-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-500 flex items-center mb-1">
                <User className="h-4 w-4 mr-1.5" /> 
                Informations personnelles
              </h3>
              <div className="space-y-3 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{client.full_name}</p>
                </div>
                
                {client.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-1.5" />
                      <p>{client.email}</p>
                    </div>
                  </div>
                )}
                
                {client.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-1.5" />
                      <p>{client.phone}</p>
                    </div>
                  </div>
                )}
                
                {client.address && (
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1.5" />
                      <p>{client.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-500 flex items-center mb-1">
                <FileText className="h-4 w-4 mr-1.5" /> 
                Informations d'identité
              </h3>
              <div className="space-y-3 mt-2">
                {client.id_type && (
                  <div>
                    <p className="text-sm text-gray-500">Type de pièce d'identité</p>
                    <p className="font-medium">
                      {client.id_type === 'cni' && 'Carte Nationale d\'Identité'}
                      {client.id_type === 'passport' && 'Passeport'}
                      {client.id_type === 'driver' && 'Permis de conduire'}
                      {client.id_type === 'voter' && 'Carte d\'électeur'}
                      {client.id_type === 'other' && 'Autre'}
                      {!['cni', 'passport', 'driver', 'voter', 'other'].includes(client.id_type) && client.id_type}
                    </p>
                  </div>
                )}
                
                {client.id_number && (
                  <div>
                    <p className="text-sm text-gray-500">Numéro de pièce d'identité</p>
                    <p className="font-medium">{client.id_number}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Niveau de KYC</p>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-1.5" />
                    <p>Niveau {client.kyc_level || 0}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Créé le</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                    <p>{new Date(client.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {client.notes && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-line">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetails;
