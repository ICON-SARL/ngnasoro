
import React from 'react';
import { Card } from '@/components/ui/card';

interface ClientDocumentsProps {
  clientId: string;
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ clientId }) => {
  return (
    <Card className="p-4">
      <div className="text-center py-8 text-gray-500">
        Aucun document n'a été téléchargé pour ce client.
      </div>
    </Card>
  );
};

export default ClientDocuments;
