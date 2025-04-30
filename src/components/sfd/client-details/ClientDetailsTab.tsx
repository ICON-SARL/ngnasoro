
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientDetailsTabProps {
  client: any;
}

export function ClientDetailsTab({ client }: ClientDetailsTabProps) {
  return (
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
          
          {client.kyc_level !== undefined && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Niveau KYC</h4>
              <p className="mt-1">{client.kyc_level}/3</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Notes</h4>
            <p className="mt-1">{client.notes || 'Aucune note'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
