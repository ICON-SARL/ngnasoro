
import React from 'react';
import ClientSavingsManagement from '@/components/sfd/ClientSavingsManagement';

// Define props interface if it doesn't exist
interface ClientDetailProps {
  clientId: string;
  clientName: string;
  sfdId: string;
}

// Adjust the component to match required props
const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, clientName, sfdId }) => {
  return (
    <div>
      <ClientSavingsManagement 
        userId={clientId} 
        name={clientName} 
        activeSfdId={sfdId} 
      />
    </div>
  );
};

export default ClientDetail;
