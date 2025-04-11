
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ClientDetailsProps {
  client: SfdClient;
  onDeleted: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onDeleted }) => {
  return (
    <Card className="p-4">
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nom complet</h3>
            <p className="text-base">{client.full_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="text-base">{client.email || 'Non renseigné'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
            <p className="text-base">{client.phone || 'Non renseigné'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
            <p className="text-base">{client.address || 'Non renseignée'}</p>
          </div>
          {client.id_type && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type de pièce d'identité</h3>
              <p className="text-base">{client.id_type}</p>
            </div>
          )}
          {client.id_number && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Numéro de pièce d'identité</h3>
              <p className="text-base">{client.id_number}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
            <p className="text-base">{new Date(client.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Statut</h3>
            <p className="text-base capitalize">{client.status}</p>
          </div>
        </div>
        
        {client.notes && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="text-base mt-1">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
